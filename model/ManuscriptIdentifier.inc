<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use MyCLabs\Enum\Enum;

class ManuscriptIdentifierType extends Enum
{
  static EnumType $graphQLEnumType;

  public const ExcavationNumber = 'ExcavationNumber';
  public const CollectionNumber = 'CollectionNumber';
  public const PublicationShortReference = 'PublicationShortReference';

}

ManuscriptIdentifierType::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptIdentifierType',
  'values' => ['ExcavationNumber', 'CollectionNumber', 'PublicationShortReference']
]);


class ManuscriptIdentifier
{
  static ObjectType $graphQLType;
  static InputObjectType $graphQLInputObjectType;

  public ManuscriptIdentifierType $type;
  public string $identifier;

  function __construct(ManuscriptIdentifierType $type, string $identifier) {
    $this->type = $type;
    $this->identifier = $identifier;
  }

  static function new(ManuscriptIdentifierType $type, string $identifier): ManuscriptIdentifier {
    return new ManuscriptIdentifier($type, $identifier);
  }

  static function fromGraphQLInput(array $input): ManuscriptIdentifier {
    return new ManuscriptIdentifier(
      new ManuscriptIdentifierType($input['identifierType']),
      $input['identifier']
    );
  }

  static function fromDbAssocArray(array $row): ManuscriptIdentifier {
    return new ManuscriptIdentifier(
      new ManuscriptIdentifierType($row['identifier_type']),
      $row['identifier']
    );
  }
}

ManuscriptIdentifier::$graphQLType = new ObjectType([
  'name' => 'ManuscriptIdentifier',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(ManuscriptIdentifierType::$graphQLEnumType),
      'resolve' => function (ManuscriptIdentifier $value) {
        return $value->type->getValue();
      }
    ],
    'identifier' => Type::nonNull(Type::string())
  ]
]);

ManuscriptIdentifier::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptIdentifierInput',
  'fields' => [
    'identifierType' => Type::nonNull(ManuscriptIdentifierType::$graphQLEnumType),
    'identifier' => Type::nonNull(Type::string())
  ]
]);