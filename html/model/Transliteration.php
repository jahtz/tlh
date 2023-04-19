<?php

namespace model;

require_once __DIR__ . '/../sql_queries.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_stmt;
use function sql_helpers\executeSingleSelectQuery;

class Transliteration
{
  const versionName = 'version';
  const inputName = 'input';

  static ObjectType $graphQLObjectType;

  public int $version;
  public string $input;

  function __construct(int $version, string $input)
  {
    $this->version = $version;
    $this->input = $input;
  }

  static function selectNewestTransliteration(string $mainIdentifier): ?Transliteration
  {
    return executeSingleSelectQuery(
      "select input from tlh_dig_provisional_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): Transliteration => new Transliteration((int)$row['version'], (string)$row['input'])
    );
  }
}

Transliteration::$graphQLObjectType = new ObjectType([
  'name' => 'Transliteration',
  'fields' => [
    Transliteration::versionName => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(Transliteration $side): int => $side->version
    ],
    Transliteration::inputName => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(Transliteration $side): string => $side->input
    ]
  ]
]);