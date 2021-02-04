<?php


namespace tlh_dig\model;

require_once __DIR__ . '/DamageContent.inc';
require_once __DIR__ . '/StringContent.inc';
require_once __DIR__ . '/CorrectionType.inc';
require_once __DIR__ . '/NumeralContent.inc';

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type, UnionType};
use mysqli;

abstract class TransliterationWordContent
{
  static UnionType $graphQLUnionType;
  static InputObjectType $graphQLInputType;

  static function readAbstractFromGraphQLInput(array $input): TransliterationWordContent {
    if (array_key_exists('stringContent', $input)) {
      return StringContent::readFromGraphQLInput($input['stringContent']);
    } else if (array_key_exists('damageContent', $input)) {
      return DamageContent::readFromGraphQLInput($input['damageContent']);
    } else if (array_key_exists('correctionContent', $input)) {
      return CorrectionContent::readFromGraphQLInput($input['correctionContent']);
    } else if (array_key_exists('numeralContent', $input)) {
      return NumeralContent::readFromGraphQLInput($input['numeralContent']);
    } else {
      // not possible!
      return new StringContent(StringContentTypeEnum::Hittite(), '');
    }
  }

  final function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_transliteration_word_contents (main_identifier, line_index, word_index, content_index, type, content, is_subscript)
values (?, ?, ?, ?, ?, ?, ?);";

    $type = $this->getType();
    $content = $this->getContent();
    $isSubscript = $this->isSubscript();

    $statement = $conn->prepare($sql);
    $statement->bind_param('siiissi', $mainIdentifier, $lineIndex, $wordIndex, $contentIndex, $type, $content, $isSubscript);
    $executed = $statement->execute();
    if (!$executed) {
      error_log("Could not save WordContent to db: " . $statement->error);
    }
    $statement->close();

    return $executed;
  }

  protected function getContent(): string {
    return '';
  }

  abstract protected function getType(): string;

  protected function isSubscript(): ?bool {
    return null;
  }

  abstract function graphQLType(): ObjectType;
}

TransliterationWordContent::$graphQLUnionType = new UnionType([
  'name' => 'TransliterationWordContentUnion',
  'types' => [
    StringContent::$graphQLObjectType,
    DamageContent::$graphQLObjectType,
    CorrectionContent::$graphQLObjectType,
    NumeralContent::$graphQLObjectType
  ],
  'resolveType' => fn(TransliterationWordContent $value) => $value->graphQLType()
]);

TransliterationWordContent::$graphQLInputType = new InputObjectType([
  'name' => 'TransliterationWordContentInputUnion',
  'fields' => [
    'stringContent' => StringContent::$graphQLInputObjectType,
    'numeralContent' => NumeralContent::$graphqlInputObjectType,
    'damageContent' => DamageType::$enumType,
    'correctionContent' => CorrectionType::$enumType,
  ]
]);

// Word

class TransliterationWord
{
  static InputObjectType $graphQLInputObjectType;
  static ObjectType $graphQLObjectType;

  /**
   * @var TransliterationWordContent[]
   */
  public array $content;

  public function __construct(array $content) {
    $this->content = $content;
  }

  static function readFromGraphQLInput(array $input): TransliterationWord {
    return new TransliterationWord(array_map(fn($x) => TransliterationWordContent::readAbstractFromGraphQLInput($x), $input['content']));
  }

  static function readWords(array $wordContents): TransliterationWord {
    // FIXME: read word contents...
    $contents = array_map(function (array $wordContent) {
      $type = $wordContent['type'];
      $content = $wordContent['content'];

      $stringContentType = StringContentTypeEnum::search($type);
      if ($stringContentType) {
        return new StringContent(new StringContentTypeEnum($stringContentType), $content);
      }

      $damageType = DamageType::search($type);
      if ($damageType) {
        return new DamageContent(new DamageType($damageType));
      }

      $correctionType = CorrectionType::search($type);
      if ($correctionType) {
        return new CorrectionContent(new CorrectionType($correctionType));
      }

      return new NumeralContent($wordContent['is_subscript'], 'x');
    }, $wordContents);

    return new TransliterationWord($contents);
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex): bool {
    $allContentSaved = true;
    foreach ($this->content as $contentIndex => $content) {
      $allContentSaved &= $content->saveToDb($conn, $mainIdentifier, $lineIndex, $wordIndex, $contentIndex);
    }
    return $allContentSaved;
  }
}

TransliterationWord::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationWordInput',
  'fields' => [
    'content' => Type::nonNull(Type::listOf(TransliterationWordContent::$graphQLInputType))
  ]
]);

TransliterationWord::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationWord',
  'fields' => [
    'content' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationWordContent::$graphQLUnionType)))
  ]
]);

