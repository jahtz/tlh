<?php


namespace tlh_dig\model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/TransliterationWord.inc';

use GraphQL\Type\Definition\{InputObjectType, ObjectType, Type};

// Line

class TransliterationLineResult
{

  static InputObjectType $graphQLInputObjectType;
  static ObjectType $graphQLObjectType;

  public int $lineNumber;
  public bool $isAbsolute;
  /**
   * @var TransliterationWord[]
   */
  public array $words;

  function __construct(int $lineNumber, bool $isAbsolute, array $words) {
    $this->lineNumber = $lineNumber;
    $this->isAbsolute = $isAbsolute;
    $this->words = $words;
  }

  static function fromDbAssocArray(int $lineNumber, bool $isAbsolute, ?array $wordContents): TransliterationLineResult {
    $words = array_map(function ($wordContents) {
      // FIXME: get input for word!
      $wordContents = TransliterationWord::readWords($wordContents);

      return new TransliterationWord('', $wordContents);
    }, $wordContents);

    return new TransliterationLineResult($lineNumber, $isAbsolute, $words);
  }

  static function readFromGraphQLInput(array $input): TransliterationLineResult {
    $words = array_map(fn($x) => TransliterationWord::readFromGraphQLInput($x), $input['words']);

    return new TransliterationLineResult($input['lineNumber'], $input['isAbsolute'], $words);
  }
}

TransliterationLineResult::$graphQLInputObjectType = new InputObjectType([
  'name' => 'TransliterationLineResultInput',
  'fields' => [
    'lineNumber' => Type::nonNull(Type::int()),
    'isAbsolute' => Type::nonNull(Type::boolean()),
    'words' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationWord::$graphQLInputObjectType)))
  ]
]);

TransliterationLineResult::$graphQLObjectType = new ObjectType([
  'name' => 'TransliterationLineResult',
  'fields' => [
    'lineNumber' => Type::nonNull(Type::int()),
    'isAbsolute' => Type::nonNull(Type::boolean()),
    'words' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationWord::$graphQLObjectType)))
  ]
]);
