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

  abstract function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool;

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

