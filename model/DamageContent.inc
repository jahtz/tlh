<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MyCLabs\Enum\Enum;
use mysqli;

class DamageType extends Enum
{
  static EnumType $enumType;

  private const DeletionStart = 'DeletionStart';
  private const DeletionEnd = 'DeletionEnd';
  private const LesionStart = 'LesionStart';
  private const LesionEnd = 'LesionEnd';
  private const RasureStart = 'RasureStart';
  private const RasureEnd = 'RasureEnd';
  private const SurplusStart = 'SurplusStart';
  private const SurplusEnd = 'SurplusEnd';
  private const SupplementStart = 'SupplementStart';
  private const SupplementEnd = 'SupplementEnd';
  private const UnknownDamageStart = 'UnknownDamageStart';
  private const UnknownDamageEnd = 'UnknownDamageEnd';
}

DamageType::$enumType = new EnumType([
  'name' => 'DamageTypeEnum',
  'values' => [
    'DeletionStart', 'DeletionEnd',
    'LesionStart', 'LesionEnd',
    'RasureStart', 'RasureEnd',
    'SurplusStart', 'SurplusEnd',
    'SupplementStart', 'SupplementEnd',
    'UnknownDamageStart', 'UnknownDamageEnd'
  ]
]);

class DamageContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;

  public DamageType $type;

  public function __construct(DamageType $type) {
    $this->type = $type;
  }

  static function readFromGraphQLInput(string $input): DamageContent {
    return new DamageContent(new DamageType($input));
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_transliteration_word_contents (main_identifier, line_index, word_index, content_index, type)
values (?, ?, ?, ?, ?);";

    $statement = $conn->prepare($sql);
    $statement->bind_param('siiis', $mainIdentifier, $lineIndex, $wordIndex, $contentIndex, $this->type);
    $executed = $statement->execute();
    if (!$executed) {
      error_log("Could not save DamageContent to db: " . $statement->error);
    }
    $statement->close();

    return $executed;
  }

  function graphQLType(): ObjectType {
    return DamageContent::$graphQLObjectType;
  }
}

DamageContent::$graphQLObjectType = new ObjectType([
  'name' => 'DamageContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(DamageType::$enumType),
      'resolve' => fn(DamageContent $damageContent) => $damageContent->type->getValue()
    ]
  ]
]);