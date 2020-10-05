<?php

namespace tlh_dig\graphql;

require_once __DIR__ . '/ManuscriptIdentifierType.inc';

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class ManuscriptIdentifier
{
  static /*ObjectType*/
    $graphQLType;
  static /* InputObjectType*/
    $graphQLInputObjectType;

  public /* ManuscriptIdentifierType */
    $type;
  public /* string */
    $identifier;

  function __construct(ManuscriptIdentifierType $type, string $identifier) {
    $this->type = $type;
    $this->identifier = $identifier;
  }

  static function new(ManuscriptIdentifierType $type, string $identifier) {
    return new ManuscriptIdentifier($type, $identifier);
  }

  static function fromGraphQLInput(array $input): ManuscriptIdentifier {
    return new ManuscriptIdentifier(
      new ManuscriptIdentifierType($input['identifierType']),
      $input['identifier']
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