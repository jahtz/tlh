<?php

namespace model;

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};


class LineNumber
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public int $lineNumber;
  public bool $isConfirmed;

  function __construct(int $lineNumber, bool $isConfirmed)
  {
    $this->lineNumber = $lineNumber;
    $this->isConfirmed = $isConfirmed;
  }

  static function fromGraphQLInput(array $input): LineNumber
  {
    return new LineNumber($input['number'], $input['isConfirmed']);
  }
}

LineNumber::$graphQLObjectType = new ObjectType([
  'name' => 'LineNumber',
  'fields' => [
    'number' => Type::nonNull(Type::int()),
    'isConfirmed' => Type::nonNull(Type::boolean())
  ]
]);

LineNumber::$graphQLInputObjectType = new InputObjectType([
  'name' => 'LineNumberInput',
  'fields' => [
    'number' => Type::nonNull(Type::int()),
    'isConfirmed' => Type::nonNull(Type::boolean())
  ]
]);