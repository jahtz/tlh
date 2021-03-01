<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use MyCLabs\Enum\Enum;

class MarkType extends Enum
{
  static EnumType $graphQLEnumType;

  private const Sign = 'Sign';
  private const TextGap = 'TextGap';
  private const FootNote = 'FootNote';
  private const Colon = 'Colon';
  private const Arbitrary = 'Arbitrary';
}

MarkType::$graphQLEnumType = new EnumType([
  'name' => 'MarkType',
  'values' => MarkType::keys()
]);

class MarkContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public MarkType $markType;

  public function __construct(MarkType $markType, string $content) {
    parent::__construct($content);
    $this->markType = $markType;
  }

  static function readFromGraphQLInput(array $input): MarkContent {
    return new MarkContent(new MarkType($input['type']), urldecode($input['content']));
  }

  protected function getType(): string {
    return $this->markType->getValue();
  }

  function graphQLType(): ObjectType {
    return MarkContent::$graphQLObjectType;
  }
}

MarkContent::$graphQLObjectType = new ObjectType([
  'name' => 'MarkContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(MarkType::$graphQLEnumType),
      'resolve' => fn(MarkContent $markContent) => $markContent->markType->getValue()
    ],
    'content' => Type::nonNull(Type::string())
  ]
]);


MarkContent::$graphQLInputObjectType = new InputObjectType([
  'name' => 'MarkContentInput',
  'fields' => [
    'type' => Type::nonNull(MarkType::$graphQLEnumType),
    'content' => Type::nonNull(Type::string())
  ]
]);