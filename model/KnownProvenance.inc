<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class KnownProvenance
{
  static ObjectType $graphQLObjectType;

  public string $englishName;
  public ?string $germanName;

  public function __construct(string $englishName, ?string $germanName) {
    $this->englishName = $englishName;
    $this->germanName = $germanName;
  }

  static function fromDbAssocArray(array $array): KnownProvenance {
    return new KnownProvenance($array['english_name'], $array['german_name']);
  }
}

KnownProvenance::$graphQLObjectType = new ObjectType([
  'name' => 'KnownProvenance',
  'fields' => [
    'englishName' => Type::nonNull(Type::string()),
    'germanName' => Type::string()
  ]
]);