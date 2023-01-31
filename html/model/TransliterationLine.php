<?php

namespace model;

require_once __DIR__ . '/LineNumber.php';

use Exception;
use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};
use mysqli;
use mysqli_result;
use mysqli_stmt;

$insertSql = "
insert into tlh_dig_transliteration_lines (main_identifier, side, manuscript_column, version, input_index, line_number, line_number_is_confirmed, input, result)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);";

$selectSql = "
select main_identifier, side, manuscript_column, version, input_index, line_number, line_number_is_confirmed, input, result 
from tlh_dig_transliteration_lines 
where main_identifier = ?;";


class TransliterationLine
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public int $inputIndex;
  public LineNumber $lineNumber;
  public string $input;
  public ?string $result;

  public function __construct(int $inputIndex, LineNumber $lineNumber, string $input, ?string $result)
  {
    $this->inputIndex = $inputIndex;
    $this->lineNumber = $lineNumber;
    $this->input = $input;
    $this->result = $result;
  }

  static function fromGraphQLInput(array $input): TransliterationLine
  {
    return new TransliterationLine(
      $input['inputIndex'],
      LineNumber::fromGraphQLInput($input['lineNumber']),
      $input['input'],
      $input['result']
    );
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, string $side, string $column, int $version): bool
  {
    global $insertSql;

    try {
      return execute_query(
        $conn,
        $insertSql,
        fn(mysqli_stmt $stmt) => $stmt->bind_param('sssiiiiss',
          $mainIdentifier, $side, $column, $version, $this->inputIndex, $this->lineNumber->lineNumber, $this->lineNumber->isConfirmed, $this->input, $this->result
        ),
        fn(mysqli_stmt $stmt) => true
      );
    } catch (Exception $e) {
      error_log("Could not insert transliteration into db: " . $e->getMessage());
      return false;
    }
  }
}

/**
 * @param string $mainIdentifier
 * @return TransliterationLine[]
 */
function getTransliterationLines(string $mainIdentifier): array
{
  global $selectSql;

  try {
    return execute_select_query(
      $selectSql,
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(mysqli_result $result): ?array => array_map(
        fn(array $x) => new TransliterationLine($x['input_index'], new LineNumber($x['line_number'], $x['line_number_is_confirmed']), $x['input'], $x['result']),
        $result->fetch_all(MYSQLI_ASSOC)
      )
    );
  } catch (Exception $e) {
    return [];
  }
}

TransliterationLine::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationLine',
  'fields' => [
    'version' => Type::nonNull(Type::int()),
    'inputIndex' => Type::nonNull(Type::int()),
    'lineNumber' => LineNumber::$graphQLObjectType,
    'input' => Type::string(),
    'result' => Type::nonNull(Type::string()),
  ]
]);

TransliterationLine::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationLineInput',
  'fields' => [
    'inputIndex' => Type::nonNull(Type::int()),
    'input' => Type::nonNull(Type::string()),
    'lineNumber' => LineNumber::$graphQLInputObjectType,
    'result' => Type::string(),
  ]
]);
