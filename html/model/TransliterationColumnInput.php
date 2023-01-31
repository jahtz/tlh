<?php

namespace model;

require_once __DIR__ . '/TransliterationLine.php';
require_once __DIR__ . '/ManuscriptColumn.php';

use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli;

class TransliterationColumnInput
{
  static InputObjectType $graphQLInputObjectType;

  public string $column;
  /**
   * @var TransliterationLine[]
   */
  public array $lines;

  function __construct(string $column, array $lines)
  {
    $this->column = $column;
    $this->lines = $lines;
  }

  static function fromGraphQLInput(array $input, int $version): TransliterationColumnInput
  {
    $column = $input['column'];

    return new TransliterationColumnInput(
      $column,
      array_map(fn($lineInput) => TransliterationLine::fromGraphQLInput($lineInput, $version), $input['lines'])
    );
  }

  function saveToDb(mysqli $conn, string $mainIdentifier, string $side, int $version): bool
  {
    return array_reduce(
      $this->lines,
      fn(bool $allSaved, TransliterationLine $line) => $allSaved && $line->saveToDb($conn, $mainIdentifier, $side, $this->column, $version),
      true
    );
  }
}

TransliterationColumnInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationColumnInput',
  'fields' => [
    'column' => Type::nonNull(ManuscriptColumn::$graphQLType),
    'lines' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationLine::$graphQLInputObjectType)))
  ]
]);