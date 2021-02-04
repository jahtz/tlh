<?php

namespace tlh_dig\model;


use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use MyCLabs\Enum\Enum;
use mysqli;

/**
 * Class StringContentTypeEnum
 * @package tlh_dig\model
 *
 * @method static StringContentTypeEnum Hittite()
 * @method static StringContentTypeEnum Akadogramm()
 * @method static StringContentTypeEnum Determinativ()
 * @method static StringContentTypeEnum MaterLectionis()
 * @method static StringContentTypeEnum Sumerogramm()
 */
class StringContentTypeEnum extends Enum
{
  static EnumType $enumType;

  public const Hittite = 'Hittite';
  public const Akadogramm = 'Akadogramm';
  public const Determinativ = 'Determinativ';
  public const MaterLectionis = 'MaterLectionis';
  public const Sumerogramm = 'Sumerogramm';
}

StringContentTypeEnum::$enumType = new EnumType([
  'name' => 'StringContentTypeEnum',
  'values' => StringContentTypeEnum::keys()
]);

class StringContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public StringContentTypeEnum $type;
  public string $content;

  public function __construct(StringContentTypeEnum $type, string $content) {
    $this->type = $type;
    $this->content = $content;
  }

  static function readFromGraphQLInput(array $input): StringContent {
    return new StringContent(new StringContentTypeEnum($input['type']), urldecode($input['content']));
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_transliteration_word_contents (main_identifier, line_index, word_index, content_index, type, content)
values (?, ?, ?, ?, ?, ?);";

    $statement = $conn->prepare($sql);
    $statement->bind_param('siiiss', $mainIdentifier, $lineIndex, $wordIndex, $contentIndex, $this->type, $this->content);
    $executed = $statement->execute();
    if (!$executed) {
      error_log("Could not save StringContent to db: " . $statement->error);
    }
    $statement->close();

    return $executed;
  }

  function graphQLType(): ObjectType {
    return StringContent::$graphQLObjectType;
  }
}

StringContent::$graphQLObjectType = new ObjectType([
  'name' => 'StringContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(StringContentTypeEnum::$enumType),
      'resolve' => fn(StringContent $stringContent) => $stringContent->type->getValue()
    ],
    'content' => Type::nonNull(Type::string())
  ]
]);

StringContent::$graphQLInputObjectType = new InputObjectType([
  'name' => 'StringContentInput',
  'fields' => [
    'type' => Type::nonNull(StringContentTypeEnum::$enumType),
    'content' => Type::nonNull(Type::string())
  ]
]);