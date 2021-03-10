<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, InputObjectType, ObjectType, Type};
use mysqli;

class Transliteration
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public string $mainIdentifier;
  public string $side;
  public int $version;
  public string $input;
  public string $resultXml;

  public function __construct(string $mainIdentifier, string $side, int $version, string $input, string $resultXml) {
    $this->mainIdentifier = $mainIdentifier;
    $this->side = $side;
    $this->version = $version;
    $this->input = $input;
    $this->resultXml = $resultXml;
  }

  static function readFromGraphQLInput(string $mainIdentifier, array $input): Transliteration {
    return new Transliteration($mainIdentifier, $input['side'], -1, $input['input'], $input['result']);
  }

  function saveToDb(mysqli $conn): bool {
    $nextVersionSql = "select max(version) as max_version from tlh_dig_transliterations where main_identifier = ? and side = ?;";

    $insertSql = "insert into tlh_dig_transliterations (main_identifier,side, version, input, result_xml) values (?, ?, ?, ?, ?);";

    $nextVersionStatement = $conn->prepare($nextVersionSql);
    $nextVersionStatement->bind_param('ss', $this->mainIdentifier, $this->side);
    $nextVersionExecuted = $nextVersionStatement->execute();

    if (!$nextVersionExecuted) {
      error_log("Could not delete TransliterationLine from db: " . $nextVersionStatement->error);
      return false;
    }

    $version = $nextVersionStatement->get_result()->fetch_assoc()['max_version'] + 1;
    $nextVersionStatement->close();

    $insertStatement = $conn->prepare($insertSql);
    $insertParamsBound = $insertStatement->bind_param('ssiss', $this->mainIdentifier, $this->side, $version, $this->input, $this->resultXml);

    if (!$insertParamsBound) {
      error_log("Could not bind params: " . $insertStatement->error);
    }

    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not insert TransliterationLine into db: " . $insertStatement->error);
    }

    $insertStatement->close();

    return $insertExecuted;
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
    'resultXml' => Type::nonNull(Type::string())
  ]
]);

Transliteration::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationInput',
  'fields' => [
    'side' => Type::nonNull($manuscriptSideType),
    'input' => Type::nonNull(Type::string()),
    'result' => Type::nonNull(Type::string())
  ]
]);
