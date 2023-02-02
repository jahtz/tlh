<?php

namespace model;

require_once __DIR__ . '/LineNumber.php';
require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_result;
use mysqli_stmt;

class TransliterationLine
{
  const selectForColumnQuery = "
select input_index, line_number, line_number_is_confirmed, input, result 
  from tlh_dig_transliteration_lines 
  where main_identifier = ? and side_index = ? and version = ? and column_index = ?;";


  static ObjectType $graphQLObjectType;

  public int $inputIndex;
  public string $input;
  public ?LineNumber $lineNumber;
  public ?string $result;

  public function __construct(int $inputIndex, ?LineNumber $lineNumber, string $input, ?string $result)
  {
    $this->inputIndex = $inputIndex;
    $this->lineNumber = $lineNumber;
    $this->input = $input;
    $this->result = $result;
  }

  /** @return TransliterationLine[] */
  static function selectTransliterationLinesForColumn(string $mainIdentifier, int $sideIndex, int $version, int $columnIndex): array
  {
    try {
      return execute_select_query(
        TransliterationLine::selectForColumnQuery,
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('siii', $mainIdentifier, $sideIndex, $version, $columnIndex),
        fn(mysqli_result $result): array => array_map(
          fn(array $x): TransliterationLine => new TransliterationLine((int)$x['input_index'], new LineNumber((int)$x['line_number'], (bool)$x['line_number_is_confirmed']), (string)$x['input'], $x['result']),
          $result->fetch_all(MYSQLI_ASSOC)
        )
      );
    } catch (Exception $e) {
      return [];
    }
  }
}

TransliterationLine::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationLine',
  'fields' => [
    'inputIndex' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(TransliterationLine $line): int => $line->inputIndex
    ],
    'lineNumber' => [
      'type' => LineNumber::$graphQLObjectType,
      'resolve' => fn(TransliterationLine $line): ?LineNumber => $line->lineNumber
    ],
    'input' => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(TransliterationLine $line): string => $line->input
    ],
    'result' => [
      'type' => Type::string(),
      'resolve' => fn(TransliterationLine $line): ?string => $line->result
    ]
  ]
]);
