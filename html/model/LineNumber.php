<?php

namespace model;

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};

const numberName = 'number';
const isConfirmedName = 'isConfirmed';

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
    return new LineNumber($input[numberName], $input[isConfirmedName]);
  }
}

LineNumber::$graphQLObjectType = new ObjectType([
  'name' => 'LineNumber',
  'fields' => [
    numberName => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(LineNumber $lineNumber): int => $lineNumber->lineNumber
    ],
    isConfirmedName => [
      'type' => Type::nonNull(Type::boolean()),
      'resolve' => fn(LineNumber $lineNumber): bool => $lineNumber->isConfirmed
    ]
  ]
]);

LineNumber::$graphQLInputObjectType = new InputObjectType([
  'name' => 'LineNumberInput',
  'fields' => [
    numberName => Type::nonNull(Type::int()),
    isConfirmedName => Type::nonNull(Type::boolean())
  ]
]);