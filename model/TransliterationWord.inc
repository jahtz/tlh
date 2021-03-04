<?php


namespace tlh_dig\model;

require_once __DIR__ . '/DamageContent.inc';
require_once __DIR__ . '/StringContent.inc';
require_once __DIR__ . '/CorrectionType.inc';
require_once __DIR__ . '/NumeralContent.inc';
require_once __DIR__ . '/MarkContent.inc';
require_once __DIR__ . '/IllegibleContent.inc';

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
    } else if (array_key_exists('illegibleContent', $input)) {
      return new IllegibleContent();
    } else {
      // not possible!
      return new StringContent(StringContentTypeEnum::Hittite(), '');
    }
  }

  abstract function toJson(): array;

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
    IllegibleContent::$graphQLObjectType,
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
    'illegibleContent' => IllegibleContent::$graphQLInputObjectType
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
      array_map(fn(array $x) => TransliterationWordContent::readAbstractFromGraphQLInput($x), $input['content'])
    );
  }

  /**
   * @param array $wordContents
   * @return TransliterationWordContent[]
   */
  static function readContent(array $wordContents): array {
    // FIXME: read word contents...
    error_log(json_encode($wordContents));

    return array_map(function (array $wordContent) {
      switch ($wordContent['_type']) {
        case StringContent::jsonTypeName:
          return StringContent::fromJson($wordContent);
        case NumeralContent::jsonTypeName:
          return NumeralContent::fromJson($wordContent);
        case DamageContent::jsonTypeName:
          return DamageContent::fromJson($wordContent);
        case MarkContent::jsonTypeName:
          return MarkContent::fromJson($wordContent);
        case CorrectionContent::jsonTypeName:
          return CorrectionContent::fromJson($wordContent);
        case 'illegible':
        default:
          return new IllegibleContent();
      }
    }, $wordContents);
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex): bool {
    $sql = "
insert into tlh_dig_words (main_identifier, line_index, word_index, word_input, content)
values (?, ?, ?, ?, ?);";

    $content = json_encode(array_map(fn(TransliterationWordContent $x) => $x->toJson(), $this->content));

    $insertStatement = $conn->prepare($sql);
    $insertStatement->bind_param('siiss', $mainIdentifier, $lineIndex, $wordIndex, $this->input, $content);
    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not insert TransliterationWord into db:" . $insertStatement->error);
    }
    $insertStatement->close();

    return $insertExecuted;
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

