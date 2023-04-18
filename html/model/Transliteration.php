<?php

namespace model;

require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_result;
use mysqli_stmt;

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
    try {
      return execute_select_query(
        "select version, input from tlh_dig_transliterations where main_identifier = ? order by version desc limit 1;",
        fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
        function (mysqli_result $result): ?Transliteration {
          $row = $result->fetch_assoc();
          return $row != null ? new Transliteration((int)$row['version'], (string)$row['input']) : null;
        }
      );
    } catch (Exception $e) {
      error_log($e);
      return null;
    }
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