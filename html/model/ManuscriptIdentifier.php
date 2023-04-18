<?php

namespace model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};

$manuscriptIdentifierTypeGraphQLType = new EnumType([
  'name' => 'ManuscriptIdentifierType',
  'values' => ['ExcavationNumber', 'CollectionNumber', 'PublicationShortReference']
]);

class ManuscriptIdentifier
{
  const identifierTypeName = 'identifierType';
  const identifierName = 'identifier';

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
    return new ManuscriptIdentifier($input[ManuscriptIdentifier::identifierTypeName], $input[ManuscriptIdentifier::identifierName]);
  }

  static function fromDbAssocArray(array $row): ManuscriptIdentifier
  {
    return new ManuscriptIdentifier($row['identifier_type'], $row['identifier']);
  }
}

ManuscriptIdentifier::$graphQLType = new ObjectType([
  'name' => 'ManuscriptIdentifier',
  'fields' => [
    ManuscriptIdentifier::identifierTypeName => [
      'type' => Type::nonNull($manuscriptIdentifierTypeGraphQLType),
      'resolve' => fn(ManuscriptIdentifier $manuscriptIdentifier): string => $manuscriptIdentifier->identifierType
    ],
    ManuscriptIdentifier::identifierName => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(ManuscriptIdentifier $manuscriptIdentifier): string => $manuscriptIdentifier->identifier
    ]
  ]
]);

ManuscriptIdentifier::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptIdentifierInput',
  'fields' => [
    ManuscriptIdentifier::identifierTypeName => Type::nonNull($manuscriptIdentifierTypeGraphQLType),
    ManuscriptIdentifier::identifierName => Type::nonNull(Type::string())
  ]
]);