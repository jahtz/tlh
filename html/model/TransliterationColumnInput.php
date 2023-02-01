<?php

namespace model;

require_once __DIR__ . '/ManuscriptColumn.php';
require_once __DIR__ . '/TransliterationLineInput.php';
require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli;
use mysqli_stmt;

const columnIndexName = 'columnIndex';
const columnName = 'column';
const columnModifierName = 'columnModifier';
const linesName = 'lines';

const insertTransliterationColumnQuery = "
insert into tlh_dig_transliteration_columns (main_identifier, side_index, version, column_index, manuscript_column, column_modifier)
values (?, ?, ?, ?, ?, ?);";

class TransliterationColumnInput
{
  static InputObjectType $graphQLInputObjectType;

  public int $columIndex;
  public string $column;
  public string $columnModifier;
  /** @var TransliterationLineInput[] */
  public array $lines;

  function __construct(int $columIndex, string $column, string $columnModifier, array $lines)
  {
    $this->columIndex = $columIndex;
    $this->column = $column;
    $this->columnModifier = $columnModifier;
    $this->lines = $lines;
  }

  static function fromGraphQLInput(array $input): TransliterationColumnInput
  {
    return new TransliterationColumnInput(
      $input[columnIndexName],
      $input[columnName],
      $input[columnModifierName],
      array_map(fn(array $lineInput): TransliterationLineInput => TransliterationLineInput::fromGraphQLInput($lineInput), $input[linesName])
    );
  }

  /** @throws Exception */
  function saveToDb(mysqli $conn, string $mainIdentifier, int $sideIndex, int $version): bool
  {
    // FIXME: save this!
    execute_query_with_connection(
      $conn,
      insertTransliterationColumnQuery,
      fn(mysqli_stmt $stmt) => $stmt->bind_param('siiiss', $mainIdentifier, $sideindex, $version, $this->columIndex, $this->column, $this->columnModifier),
      fn(mysqli_stmt $_result) => true
    );

    return array_reduce(
      $this->lines,
      fn(bool $allSaved, TransliterationLineInput $line): bool => $allSaved && $line->saveToDb($conn, $mainIdentifier, $sideIndex, $version, $this->columIndex),
      true
    );
  }
}

TransliterationColumnInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationColumnInput',
  'fields' => [
    columnIndexName => Type::nonNull(Type::int()),
    columnName => Type::nonNull(ManuscriptColumn::$graphQLType),
    columnModifierName => Type::nonNull(ManuscriptColumnModifier::$graphQLType),
    linesName => Type::nonNull(Type::listOf(Type::nonNull(TransliterationLineInput::$graphQLInputObjectType)))
  ]
]);