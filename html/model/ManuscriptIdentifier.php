<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};

$manuscriptIdentifierTypeGraphQLEnumType = new EnumType([
  'name' => 'ManuscriptIdentifierType',
  'values' => ['ExcavationNumber', 'CollectionNumber', 'PublicationShortReference']
]);

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
    return new ManuscriptIdentifier($input['identifierType'], $input['identifier']);
  }

  static function fromDbAssocArray(array $row): ManuscriptIdentifier
  {
    return new ManuscriptIdentifier($row['identifier_type'], $row['identifier']);
  }
}

ManuscriptIdentifier::$graphQLType = new ObjectType([
  'name' => 'ManuscriptIdentifier',
  'fields' => [
    'identifierType' => Type::nonNull($manuscriptIdentifierTypeGraphQLEnumType),
    'identifier' => Type::nonNull(Type::string())
  ]
]);

ManuscriptIdentifier::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptIdentifierInput',
  'fields' => [
    'identifierType' => Type::nonNull($manuscriptIdentifierTypeGraphQLEnumType),
    'identifier' => Type::nonNull(Type::string())
  ]
]);