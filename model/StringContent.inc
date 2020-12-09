<?php

namespace tlh_dig\model;


use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use MyCLabs\Enum\Enum;

class StringContentTypeEnum extends Enum
{
  static /* EnumType */
    $enumType;

  private const Akadogramm = 'Akadogramm';
  private const Determinativ = 'Determinativ';
  private const MaterLectionis = 'MaterLectionis';
  private const Sumerogramm = 'Sumerogramm';
}

StringContentTypeEnum::$enumType = new EnumType([
  'name' => 'StringContentTypeEnum',
  'values' => ['Akadogramm', 'Determinativ', 'MaterLectionis', 'Sumerogramm']
]);

class StringContent
{
  static /* InputObjectType */
    $graphQLInputType;
}

StringContent::$graphQLInputType = new InputObjectType([
  'name' => 'StringContentInput',
  'fields' => [
    'type' => Type::nonNull(StringContentTypeEnum::$enumType),
    'content' => Type::nonNull(Type::string())
  ]
]);