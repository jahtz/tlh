<?php

namespace tlh_dig\model;

use Exception;
use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use mysqli;
use mysqli_result;
use mysqli_stmt;

class Transliteration
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public string $mainIdentifier;
  public string $side;
  public int $version;
  public string $input;
  public string $resultXml;
  public string $resultJson;

  public function __construct(string $mainIdentifier, string $side, int $version, string $input, string $resultXml, string $resultJson) {
    $this->mainIdentifier = $mainIdentifier;
    $this->side = $side;
    $this->version = $version;
    $this->input = $input;
    $this->resultXml = $resultXml;
    $this->resultJson = $resultJson;
  }

  static function readFromGraphQLInput(string $mainIdentifier, array $input): Transliteration {
    return new Transliteration($mainIdentifier, $input['side'], -1, $input['input'], $input['resultXml'], $input['resultJson']);
  }

  function saveToDb(mysqli $conn): bool {
    $nextVersionSql = "select max(version) as max_version from tlh_dig_transliterations where main_identifier = ? and side = ?;";

    $nextVersionStatement = $conn->prepare($nextVersionSql);
    $nextVersionStatement->bind_param('ss', $this->mainIdentifier, $this->side);
    $nextVersionExecuted = $nextVersionStatement->execute();

    if (!$nextVersionExecuted) {
      error_log("Could not delete TransliterationLine from db: " . $nextVersionStatement->error);
      return false;
    }

    $version = $nextVersionStatement->get_result()->fetch_assoc()['max_version'] + 1;
    $nextVersionStatement->close();

    $insertSql = "
insert into tlh_dig_transliterations (main_identifier, side, version, input, result_xml, result_json)
values (?, ?, ?, ?, ?, ?);";

    $conn = connect_to_db();

    try {
      $executed = execute_query(
        $conn,
        $insertSql,
        fn(mysqli_stmt $stmt) => $stmt->bind_param('ssisss',
          $this->mainIdentifier, $this->side, $version, $this->input, $this->resultXml, $this->resultJson
        ),
        fn(mysqli_stmt $stmt) => true
      );

      $conn->close();

      return $executed;
    } catch (Exception $e) {
      error_log("Could not insert transliteration into db: " . $e->getMessage());
      return false;
    }
  }
}


/**
 * @param string $mainIdentifier
 * @return ?Transliteration[]
 */
function getTransliterations(string $mainIdentifier): ?array {
  $sql = "select main_identifier, side, version, input, result_xml, result_json from tlh_dig_transliterations where main_identifier = ?;";

  try {
    return execute_select_query(
      $sql,
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      function (mysqli_result $result): ?array {
        $allRows = $result->fetch_all(MYSQLI_ASSOC);

        return count($allRows) === 0
          ? null
          : array_map(
            fn(array $x) => new Transliteration($x['main_identifier'], $x['side'], $x['version'], $x['input'], $x['result_xml'], $x['result_json']),
            $allRows
          );
      });
  } catch (Exception $e) {
    return null;
  }
}


$manuscriptSideType = new EnumType([
  'name' => 'ManuscriptSide',
  'values' => [
    'NotIdentifiable', 'Obverse', 'Reverse', 'LowerEdge', 'UpperEdge', 'LeftEdge', 'RightEdge',
    'SideA', 'SideB', 'InscriptionNumber', 'SealInscription'
  ]
]);

Transliteration::$graphQLObjectType = new ObjectType([
  'name' => 'Transliteration',
  'fields' => [
    'side' => Type::nonNull($manuscriptSideType),
    'version' => Type::nonNull(Type::int()),
    'input' => Type::nonNull(Type::string()),
    'resultXml' => Type::nonNull(Type::string()),
    'resultJson' => Type::nonNull(Type::string())
  ]
]);

Transliteration::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationInput',
  'fields' => [
    'side' => Type::nonNull($manuscriptSideType),
    'input' => Type::nonNull(Type::string()),
    'resultXml' => Type::nonNull(Type::string()),
    'resultJson' => Type::nonNull(Type::string())
  ]
]);
