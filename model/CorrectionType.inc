<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MyCLabs\Enum\Enum;
use mysqli;

class CorrectionType extends Enum
{
  static EnumType $enumType;

  private const UnsureCorrection = 'UnsureCorrection';
  private const MaybeUnsureCorrection = 'MaybeUnsureCorrection';
  private const SureCorrection = 'SureCorrection';
  private const SicCorrection = 'SicCorrection';
  private const Ellipsis = 'Ellipsis';
  private const ParagraphEnd = 'ParagraphEnd';

}

CorrectionType::$enumType = new EnumType([
  'name' => 'CorrectionType',
  'values' => ['UnsureCorrection', 'MaybeUnsureCorrection', 'SureCorrection', 'SicCorrection', 'Ellipsis', 'ParagraphEnd']
]);

class CorrectionContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  public CorrectionType $type;

  public function __construct(CorrectionType $type) {
    $this->type = $type;
  }

  static function readFromGraphQLInput(string $type): CorrectionContent {
    return new CorrectionContent(new CorrectionType($type));
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_transliteration_word_contents (main_identifier, line_index, word_index, content_index, type)
values (?, ?, ?, ?, ?);";

    $statement = $conn->prepare($sql);
    $statement->bind_param('siiis', $mainIdentifier, $lineIndex, $wordIndex, $contentIndex, $this->type);
    $executed = $statement->execute();
    if (!$executed) {
      error_log("\t\tCould not save CorrectionContent to db: " . $statement->error);
    }
    $statement->close();

    return $executed;
  }

  function graphQLType(): ObjectType {
    return CorrectionContent::$graphQLObjectType;
  }
}

CorrectionContent::$graphQLObjectType = new ObjectType([
  'name' => 'CorrectionContent',
  'fields' => [
    'type' => Type::nonNull(CorrectionType::$enumType)
  ]
]);