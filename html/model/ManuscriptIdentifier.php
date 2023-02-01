<?php

namespace model;

require_once __DIR__ . '/ManuscriptIdentifierType.php';

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};

const identifierTypeName = 'identifierType';
const identifierName = 'identifier';

class ManuscriptIdentifier
{
  static ObjectType $graphQLType;
  static InputObjectType $graphQLInputObjectType;

  public string $identifierType;
  public string $identifier;

  function __construct(string $identifierType, string $identifier)
  {
    $this->identifierType = $identifierType;
    $this->identifier = $identifier;
  }

  static function fromGraphQLInput(array $input): ManuscriptIdentifier
  {
    return new ManuscriptIdentifier($input[identifierTypeName], $input[identifierName]);
  }

  static function fromDbAssocArray(array $row): ManuscriptIdentifier
  {
    return new ManuscriptIdentifier($row['identifier_type'], $row['identifier']);
  }
}

ManuscriptIdentifier::$graphQLType = new ObjectType([
  'name' => 'ManuscriptIdentifier',
  'fields' => [
    identifierTypeName => [
      'type' => Type::nonNull(ManuscriptIdentifierType::$graphQLType),
      'resolve' => fn(ManuscriptIdentifier $manuscriptIdentifier): string => $manuscriptIdentifier->identifierType
    ],
    identifierName => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(ManuscriptIdentifier $manuscriptIdentifier): string => $manuscriptIdentifier->identifier
    ]
  ]
]);

ManuscriptIdentifier::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptIdentifierInput',
  'fields' => [
    identifierTypeName => Type::nonNull(ManuscriptIdentifierType::$graphQLType),
    identifierName => Type::nonNull(Type::string())
  ]
]);