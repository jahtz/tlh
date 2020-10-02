<?php

namespace tlh_dig\graphql;

require_once __DIR__ . '/ManuscriptIdentifierType.inc';

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class ManuscriptIdentifier
{
  static $graphQLType;

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