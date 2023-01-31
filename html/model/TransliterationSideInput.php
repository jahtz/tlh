<?php

namespace model;

require_once __DIR__ . '/ManuscriptSide.php';
require_once __DIR__ . '/TransliterationColumnInput.php';

use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli;

class TransliterationSideInput
{
  static InputObjectType $graphQLInputObjectType;

  public string $side;
  /**
   * @var TransliterationColumnInput[]
   */
  public array $columns;

  function __construct(string $side, array $columns)
  {
    $this->side = $side;
    $this->columns = $columns;
  }

  static function fromGraphQLInput(array $input, int $version): TransliterationSideInput
  {
    return new TransliterationSideInput(
      $input['side'],
      array_map(fn(array $colInput) => TransliterationColumnInput::fromGraphQLInput($colInput, $version), $input['columns'])
    );
  }

  function saveToDb(mysqli $connection, string $mainIdentifier, int $version): bool
  {
    return array_reduce(
      $this->columns,
      fn(bool $allSaved, TransliterationColumnInput $column) => $allSaved && $column->saveToDb($connection, $mainIdentifier, $this->side, $version),
      true
    );
  }
}

TransliterationSideInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationSideInput',
  'fields' => [
    'side' => Type::nonNull(ManuscriptSide::$graphQLType),
    'columns' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationColumnInput::$graphQLInputObjectType)))
  ]
]);
