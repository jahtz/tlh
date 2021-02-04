<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use mysqli;

class NumeralContent extends TransliterationWordContent
{
  static ObjectType $graphQLObjectType;
  static InputObjectType $graphqlInputObjectType;

  private string $type = 'numeral';
  public bool $isSubscript;
  public string $content;

  public function __construct(bool $isSubscript, string $content) {
    $this->isSubscript = $isSubscript;
    $this->content = $content;
  }

  static function readFromGraphQLInput(array $input): NumeralContent {
    return new NumeralContent($input['isSubscript'], urldecode($input['content']));
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, int $lineIndex, int $wordIndex, int $contentIndex): bool {
    $sql = "
insert into tlh_dig_transliteration_word_contents (main_identifier, line_index, word_index, content_index, type, content, is_subscript)
values (?, ?, ?, ?, ?, ?, ?);";

    $statement = $conn->prepare($sql);
    $statement->bind_param('siiissi', $mainIdentifier, $lineIndex, $contentIndex, $wordIndex, $this->type, $this->content, $this->isSubscript);
    $executed = $statement->execute();
    if (!$executed) {
      error_log("\t\tCould not save NumeralContent to db: " . $statement->error);
    }
    $statement->close();

    return $executed;
  }

  function graphQLType(): ObjectType {
    return NumeralContent::$graphQLObjectType;
  }
}

NumeralContent::$graphQLObjectType = new ObjectType([
  'name' => 'NumeralContent',
  'fields' => [
    'isSubscript' => Type::nonNull(Type::boolean()),
    'content' => Type::nonNull(Type::string())
  ]
]);

NumeralContent::$graphqlInputObjectType = new InputObjectType([
  'name' => 'NumeralContentInput',
  'fields' => [
    'isSubscript' => Type::nonNull(Type::boolean()),
    'content' => Type::nonNull(Type::string())
  ]
]);
