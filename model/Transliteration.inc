<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};
use mysqli;

class Transliteration
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphQLInputObjectType;

  public string $mainIdentifier;
  public int $version;
  public string $input;
  public string $resultXml;

  public function __construct(string $mainIdentifier, int $version, string $input, string $resultXml) {
    $this->mainIdentifier = $mainIdentifier;
    $this->version = $version;
    $this->input = $input;
    $this->resultXml = $resultXml;
  }

  static function fromDbAssocArray(array $array, ?array $wordForLine): Transliteration {
    return new Transliteration(
      $array['main_identifier'],
      $array['version'],
      $array['transliteration_input'],
      $array['transliteration_result_xml']
    );
  }

  static function readFromGraphQLInput(string $mainIdentifier, array $input): Transliteration {
    return new Transliteration($mainIdentifier, -1, $input['input'], $input['result']);
  }

  function saveToDb(mysqli $conn): bool {
    $nextVersionSql = "select max(version) as max_version from tlh_dig_transliterations where main_identifier = ?;";

    $insertSql = "insert into tlh_dig_transliterations (main_identifier, version, input, result_xml) values (?, ?, ?, ?);";

    $nextVersionStatement = $conn->prepare($nextVersionSql);
    $nextVersionStatement->bind_param('s', $this->mainIdentifier);
    $nextVersionExecuted = $nextVersionStatement->execute();

    if (!$nextVersionExecuted) {
      error_log("Could not delete TransliterationLine from db: " . $nextVersionStatement->error);
      return false;
    }

    $version = $nextVersionStatement->get_result()->fetch_object();
    $nextVersionStatement->close();

    $insertStatement = $conn->prepare($insertSql);
    $insertStatement->bind_param('sisii', $this->mainIdentifier, $version, $this->input, $this->resultXml);

    $insertExecuted = $insertStatement->execute();
    if (!$insertExecuted) {
      error_log("Could not insert TransliterationLine into db: " . $insertStatement->error);
    }

    $insertStatement->close();

    return $insertExecuted;
  }
}

Transliteration::$graphQLObjectType = new ObjectType([
  'name' => 'Transliteration',
  'fields' => [
    'version' => Type::nonNull(Type::int()),
    'input' => Type::nonNull(Type::string()),
    'resultXml' => Type::nonNull(Type::string())
  ]
]);

Transliteration::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationInput',
  'fields' => [
    'input' => Type::nonNull(Type::string()),
    'result' => Type::nonNull(Type::string())
  ]
]);
