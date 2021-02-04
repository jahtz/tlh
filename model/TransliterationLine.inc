<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};
use mysqli;

require_once __DIR__ . '/../model/TransliterationLineResult.inc';

class TransliterationLine
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public string $mainIdentifier;
  public int $lineIndex;
  public string $transliterationLineInput;
  public ?TransliterationLineResult $result;

  public function __construct(string $mainIdentifier, int $lineIndex, string $transliterationLineInput, ?TransliterationLineResult $result) {
    $this->mainIdentifier = $mainIdentifier;
    $this->lineIndex = $lineIndex;
    $this->transliterationLineInput = $transliterationLineInput;
    $this->result = $result;
  }

  static function fromDbAssocArray(array $array, array $wordContents): TransliterationLine {
    $mainIdentifier = $array['main_identifier'];
    $lineIndex = $array['line_index'];

    $result = null;
    if (array_key_exists('result_line_number', $array) && array_key_exists('result_line_is_absolute', $array)) {
      $result = TransliterationLineResult::fromDbAssocArray($array['result_line_number'], $array['result_line_is_absolute'], $wordContents);
    }

    return new TransliterationLine($mainIdentifier, $lineIndex, $array['transliteration_input'], $result);
  }

  static function readFromGraphQLInput(string $mainIdentifier, array $input): TransliterationLine {
    return new TransliterationLine(
      $mainIdentifier, $input['lineIndex'], $input['transliterationLineInput'],
      array_key_exists('result', $input) ? TransliterationLineResult::readFromGraphQLInput($input['result']) : null
    );
  }

  function saveToDb(mysqli $conn): bool {
    $deleteSql = "
delete from tlh_dig_transliteration_lines
where main_identifier = ? and line_index = ?;";

    $insertSql = "
insert into tlh_dig_transliteration_lines (main_identifier, line_index, transliteration_input, result_line_number, result_line_is_absolute)
values (?, ?, ?, ?, ?);";

    $deleteStatement = $conn->prepare($deleteSql);
    $deleteStatement->bind_param('si', $this->mainIdentifier, $this->lineIndex);
    $deleteExecuted = $deleteStatement->execute();
    if (!$deleteExecuted) {
      error_log("Could not delete TransliterationLine from db: " . $deleteStatement->error);
    }
    $deleteStatement->close();

    if (!$deleteExecuted) {
      return false;
    }

    $insertStatement = $conn->prepare($insertSql);
    $insertStatement->bind_param('sisii', $this->mainIdentifier, $this->lineIndex, $this->transliterationLineInput, $this->result->lineNumber, $this->result->isAbsolute,);
    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not insert TransliterationLine into db: " . $insertStatement->error);
    }
    $insertStatement->close();

    if (!$insertExecuted) {
      return false;
    }

    $allWordsSaved = true;
    foreach ($this->result->words as $wordIndex => $word) {
      $allWordsSaved &= $word->saveToDb($conn, $this->mainIdentifier, $this->lineIndex, $wordIndex);
    }
    return $allWordsSaved;
  }
}

TransliterationLine::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationLine',
  'fields' => [
    'lineIndex' => Type::nonNull(Type::int()),
    'transliterationLineInput' => Type::nonNull(Type::string()),
    'result' => TransliterationLineResult::$graphQLObjectType
  ]
]);

TransliterationLine::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationLineInput',
  'fields' => [
    'lineIndex' => Type::nonNull(Type::int()),
    'transliterationLineInput' => Type::nonNull(Type::string()),
    'result' => TransliterationLineResult::$graphQLInputObjectType
  ]
]);
