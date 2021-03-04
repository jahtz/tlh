<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use MyCLabs\Enum\Enum;

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

  static function fromString(string $value): StringContentTypeEnum {
    return new StringContentTypeEnum($value);
  }
}

StringContentTypeEnum::$enumType = new EnumType([
  'name' => 'StringContentTypeEnum',
  'values' => StringContentTypeEnum::keys()
]);

class StringContent extends TransliterationWordContent
{
  const jsonTypeName = 'stringContent';

  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public StringContentTypeEnum $stringContentType;

  public function __construct(StringContentTypeEnum $stringContentType, string $content) {
    parent::__construct($content);
    $this->stringContentType = $stringContentType;
  }

  static function readFromGraphQLInput(array $input): StringContent {
    return new StringContent(StringContentTypeEnum::fromString($input['type']), urldecode($input['content']));
  }

  function graphQLType(): ObjectType {
    return StringContent::$graphQLObjectType;
  }

  static function fromJson(array $wordContent): StringContent {
    return new StringContent(new StringContentTypeEnum($wordContent['stringContentType']), $wordContent['content']);
  }

  function toJson(): array {
    return [
      '_type' => StringContent::jsonTypeName,
      'stringContentType' => $this->stringContentType->getValue(),
      'content' => $this->content
    ];
  }
}

StringContent::$graphQLObjectType = new ObjectType([
  'name' => 'StringContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(StringContentTypeEnum::$enumType),
      'resolve' => fn(StringContent $stringContent) => $stringContent->stringContentType->getValue()
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