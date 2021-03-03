<?php


namespace tlh_dig\model;

require_once __DIR__ . '/DamageContent.inc';
require_once __DIR__ . '/StringContent.inc';
require_once __DIR__ . '/CorrectionType.inc';
require_once __DIR__ . '/NumeralContent.inc';
require_once __DIR__ . '/MarkContent.inc';
require_once __DIR__ . '/XContent.inc';

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type, UnionType};
use mysqli;

abstract class TransliterationWordContent
{
  static UnionType $graphQLUnionType;
  static InputObjectType $graphQLInputType;

  public string $content;

  function __construct(string $content) {
    $this->content = $content;
  }

  static function readAbstractFromGraphQLInput(array $input): TransliterationWordContent {
    if (array_key_exists('stringContent', $input)) {
      return StringContent::readFromGraphQLInput($input['stringContent']);
    } else if (array_key_exists('damageContent', $input)) {
      return DamageContent::readFromGraphQLInput($input['damageContent']);
    } else if (array_key_exists('correctionContent', $input)) {
      return CorrectionContent::readFromGraphQLInput($input['correctionContent']);
    } else if (array_key_exists('numeralContent', $input)) {
      return NumeralContent::readFromGraphQLInput($input['numeralContent']);
    } else if (array_key_exists('markContent', $input)) {
      return MarkContent::readFromGraphQLInput($input['markContent']);
    } else if (array_key_exists('xContent', $input)) {
      return new XContent();
    } else {
      // not possible!
      return new StringContent(StringContentTypeEnum::Hittite(), '');
    }
  }

  final function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_word_contents (main_identifier, line_index, word_index, content_index, type, content, is_subscript)
values (?, ?, ?, ?, ?, ?, ?);";

    $type = $this->getType();
    $content = $this->content;
    $isSubscript = $this->isSubscript();

    $insertStatement = $conn->prepare($sql);
    $insertStatement->bind_param('siiissi', $mainIdentifier, $lineIndex, $wordIndex, $contentIndex, $type, $content, $isSubscript);
    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not save WordContent to db: " . $insertStatement->error);
    }
    $insertStatement->close();

    return $insertExecuted;
  }

  abstract protected function getType(): string;

  protected function isSubscript(): ?bool {
    return null;
  }

  abstract function graphQLType(): ObjectType;
}

TransliterationWordContent::$graphQLUnionType = new UnionType([
  'name' => 'WordContentUnion',
  'types' => [
    StringContent::$graphQLObjectType,
    DamageContent::$graphQLObjectType,
    CorrectionContent::$graphQLObjectType,
    NumeralContent::$graphQLObjectType,
    MarkContent::$graphQLObjectType,
    XContent::$graphQLObjectType,
  ],
  'resolveType' => fn(TransliterationWordContent $value) => $value->graphQLType()
]);

TransliterationWordContent::$graphQLInputType = new InputObjectType([
  'name' => 'WordContentInputUnion',
  'fields' => [
    'stringContent' => StringContent::$graphQLInputObjectType,
    'numeralContent' => NumeralContent::$graphqlInputObjectType,
    'damageContent' => DamageType::$enumType,
    'correctionContent' => CorrectionType::$enumType,
    'markContent' => MarkContent::$graphQLInputObjectType,
    'xContent' => XContent::$graphQLInputObjectType
  ]
]);

// Word

class TransliterationWord
{
  static InputObjectType $graphQLInputObjectType;
  static ObjectType $graphQLObjectType;


  public string $input;
  /**
   * @var TransliterationWordContent[]
   */
  public array $content;

  public function __construct(string $input, array $content) {
    $this->input = $input;
    $this->content = $content;
  }

  static function readFromGraphQLInput(array $input): TransliterationWord {
    return new TransliterationWord(
      $input['input'],
      array_map(fn(array $x): TransliterationWordContent => TransliterationWordContent::readAbstractFromGraphQLInput($x), $input['content'])
    );
  }

  /**
   * @param array $wordContents
   * @return TransliterationWordContent[]
   */
  static function readWords(array $wordContents): array {
    // FIXME: read word contents...
    return array_map(function (array $wordContent) {
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

      $markType = MarkType::search($type);
      if ($markType) {
        return new MarkContent(new MarkType($markType), $content);
      }

      $isSubscript = $wordContent['is_subscript'];
      if (isset($isSubscript)) {
        return new NumeralContent($isSubscript, 'x');
      }

      return new XContent();
    }, $wordContents);
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex): bool {
    $sql = "
insert into tlh_dig_words (main_identifier, line_index, word_index, word_input)
values (?, ?, ?, ?);";

    $insertStatement = $conn->prepare($sql);
    $insertStatement->bind_param('siis', $mainIdentifier, $lineIndex, $wordIndex, $this->input);
    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not insert TransliterationWord into db:" . $insertStatement->error);
    }
    $insertStatement->close();

    if (!$insertExecuted) {
      return false;
    }

    $allContentSaved = true;
    foreach ($this->content as $contentIndex => $content) {
      $allContentSaved &= $content->saveToDb($conn, $mainIdentifier, $lineIndex, $wordIndex, $contentIndex);
    }

    return $allContentSaved;
  }
}

TransliterationWord::$graphQLInputObjectType = new InputObjectType([
  'name' => 'WordInput',
  'fields' => [
    'input' => Type::nonNull(Type::string()),
    'content' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationWordContent::$graphQLInputType)))
  ]
]);

TransliterationWord::$graphQLObjectType = new ObjectType([
  'name' => 'Word',
  'fields' => [
    'input' => Type::nonNull(Type::string()),
    'content' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationWordContent::$graphQLUnionType)))
  ]
]);

