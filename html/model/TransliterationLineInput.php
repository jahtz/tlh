<?php

namespace model;

require_once __DIR__ . '/LineNumber.php';
require_once __DIR__ . '/../sql_queries.php';

use Exception;
use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli;
use mysqli_stmt;

const lineIndexName = 'lineIndex';
const inputName = 'input';
const lineNumberName = 'lineNumber';
const resultName = 'result';

const insertTransliterationLineQuery = "
insert into tlh_dig_transliteration_lines (main_identifier, side_index, version, column_index, input_index, line_number, line_number_is_confirmed, input, result)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);";

class TransliterationLineInput
{
  static InputObjectType $graphQLInputObjectType;

  public int $lineIndex;
  public string $input;
  public ?LineNumber $lineNumber;
  public ?string $result;

  function __construct(int $lineIndex, string $input, ?LineNumber $lineNumber, ?string $result)
  {
    $this->lineIndex = $lineIndex;
    $this->input = $input;
    $this->lineNumber = $lineNumber;
    $this->result = $result;
  }

  static function fromGraphQLInput(array $input): TransliterationLineInput
  {
    // FIXME: what if $input[lineNumberName == null?
    return new TransliterationLineInput($input[lineIndexName], $input[inputName], LineNumber::fromGraphQLInput($input[lineNumberName]), $input[resultName]);
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $sideIndex, int $version, int $columnIndex): bool
  {
    try {
      return execute_query_with_connection(
        $conn,
        insertTransliterationLineQuery,
        fn(mysqli_stmt $stmt) => $stmt->bind_param('siiiiiiss',
          $mainIdentifier, $sideIndex, $version, $columnIndex, $this->lineIndex, $this->lineNumber->lineNumber, $this->lineNumber->isConfirmed, $this->input, $this->result
        ),
        fn(mysqli_stmt $_stmt) => true
      );
    } catch (Exception $e) {
      error_log("Could not insert transliteration into db: " . $e->getMessage());
      return false;
    }
  }
}

TransliterationLineInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationLineInput',
  'fields' => [
    lineIndexName => Type::nonNull(Type::int()),
    inputName => Type::nonNull(Type::string()),
    lineNumberName => LineNumber::$graphQLInputObjectType,
    resultName => Type::string(),
  ]
]);
