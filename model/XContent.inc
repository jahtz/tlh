<?php


namespace tlh_dig\model;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class XContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public function __construct() {
    parent::__construct('');
  }

  protected function getType(): string {
    // TODO: Implement getType() method.
    return 'x';
  }

  function graphQLType(): ObjectType {
    // TODO: Implement graphQLType() method.
    return XContent::$graphQLObjectType;
  }
}

XContent::$graphQLObjectType = new ObjectType([
  'name' => 'XContent',
  'fields' => [
    '_x' => [
      'type' => Type::boolean(),
      'resolve' => fn() => false
    ]
  ]
]);

XContent::$graphQLInputObjectType = new InputObjectType([
  'name' => 'XContentInput',
  'fields' => [
    'x' => Type::string()
  ]
]);