<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};

class IllegibleContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public function __construct() {
    parent::__construct('x');
  }

  function graphQLType(): ObjectType {
    return IllegibleContent::$graphQLObjectType;
  }

  function toJson(): array {
    return ['_type' => 'illegible'];
  }
}

IllegibleContent::$graphQLObjectType = new ObjectType([
  'name' => 'IllegibleContent',
  'fields' => ['_x' => ['type' => Type::boolean(), 'resolve' => fn() => false]]
]);

IllegibleContent::$graphQLInputObjectType = new InputObjectType([
  'name' => 'IllegibleContentInput',
  'fields' => ['x' => Type::string()]
]);