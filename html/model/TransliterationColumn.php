<?php

namespace model;

require_once __DIR__ . '/TransliterationLine.php';
require_once __DIR__ . '/ManuscriptColumn.php';
require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_result;
use mysqli_stmt;


class TransliterationColumn
{
  const selectForSideQuery = "
select main_identifier, side_index, version, column_index, manuscript_column, column_modifier
    from tlh_dig_transliteration_columns
    where main_identifier = ? and side_index = ? and version = ?;";

  static ObjectType $graphQLObjectType;

  public string $mainIdentifier;
  public int $sideIndex;
  public int $version;
  public int $columnIndex;
  public string $column;
  public string $columnModifier;

  function __construct(string $mainIdentifier, int $sideIndex, int $version, int $columnIndex, string $column, string $columnModifier)
  {
    $this->mainIdentifier = $mainIdentifier;
    $this->sideIndex = $sideIndex;
    $this->version = $version;
    $this->columnIndex = $columnIndex;
    $this->column = $column;
    $this->columnModifier = $columnModifier;
  }

  /** @return TransliterationColumn[] */
  static function selectTransliterationColumnsForSide(string $mainIdentifier, int $sideIndex, int $version): array
  {
    try {
      return execute_select_query(
        TransliterationColumn::selectForSideQuery,
        fn(mysqli_stmt $stmt) => $stmt->bind_param('sii', $mainIdentifier, $sideIndex, $version),
        fn(mysqli_result $result): array => array_map(
          fn(array $row): TransliterationColumn => new TransliterationColumn((string)$row['main_identifier'], (int)$row['side_index'], (int)$row['version'], (int)$row['column_index'], (string)$row['manuscript_column'], (string)$row['column_modifier']),
          $result->fetch_all(MYSQLI_ASSOC)
        )
      );
    } catch (Exception $e) {
      error_log($e->getMessage());
      return [];
    }
  }

}

TransliterationColumn::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationColumn',
  'fields' => [
    'columnIndex' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(TransliterationColumn $column): int => $column->columnIndex
    ],
    'column' => [
      'type' => Type::nonNull(ManuscriptColumn::$graphQLType),
      'resolve' => fn(TransliterationColumn $column): string => $column->column
    ],
    'columnModifier' => [
      'type' => Type::nonNull(ManuscriptColumnModifier::$graphQLType),
      'resolve' => fn(TransliterationColumn $column): string => $column->columnModifier
    ],
    'lines' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationLine::$graphQLObjectType))),
      'resolve' => fn(TransliterationColumn $column): array => TransliterationLine::selectTransliterationLinesForColumn($column->mainIdentifier, $column->sideIndex, $column->version, $column->columnIndex)
    ]
  ]
]);