<?php

namespace model;

require_once __DIR__ . '/ManuscriptSide.php';
require_once __DIR__ . '/TransliterationColumn.php';
require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_result;
use mysqli_stmt;

class TransliterationSide
{
  const selectForManuscriptQuery = "select main_identifier, side_index, version, side from tlh_dig_transliteration_sides where main_identifier = ?;";

  static ObjectType $graphQLObjectType;

  public string $manuscriptIdentifier;
  public int $sideIndex;
  public int $version;
  public string $side;

  function __construct(string $manuscriptIdentifier, int $sideIndex, int $version, string $side)
  {
    $this->manuscriptIdentifier = $manuscriptIdentifier;
    $this->sideIndex = $sideIndex;
    $this->version = $version;
    $this->side = $side;
  }

  /** @return TransliterationSide[] */
  static function selectTransliterationSides(string $mainIdentifier): array
  {
    try {
      return execute_select_query(
        TransliterationSide::selectForManuscriptQuery,
        fn(mysqli_stmt $stmt) => $stmt->bind_param('s', $mainIdentifier),
        fn(mysqli_result $result): array => array_map(
          fn(array $row): TransliterationSide => new TransliterationSide((string)$row['main_identifier'], (int)$row['side_index'], (int)$row['version'], (string)$row['side']),
          $result->fetch_all(MYSQLI_ASSOC)
        )
      );
    } catch (Exception $e) {
      error_log($e->getMessage());
      return [];
    }
  }
}

TransliterationSide::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationSide',
  'fields' => [
    'sideIndex' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(TransliterationSide $side): int => $side->sideIndex
    ],
    'version' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(TransliterationSide $side): int => $side->version
    ],
    'side' => [
      'type' => Type::nonNull(ManuscriptSide::$graphQLType),
      'resolve' => fn(TransliterationSide $side): string => $side->side
    ],
    'columns' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationColumn::$graphQLObjectType))),
      'resolve' => fn(TransliterationSide $side): array => TransliterationColumn::selectTransliterationColumnsForSide($side->manuscriptIdentifier, $side->sideIndex, $side->version)
    ]
  ]
]);