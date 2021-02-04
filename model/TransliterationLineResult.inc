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

  static function fromDbAssocArray(int $lineNumber, bool $isAbsolute, array $wordContents): TransliterationLineResult {
    // FIXME: read result words!
    $words = [];

    foreach ($wordContents as $key => $wc) {
      $contents = [];

      foreach ($wc as $contentKey => $c) {
        $contents[] = new StringContent(new StringContentTypeEnum('Hittite'), '');
      }

      $words[] = new TransliterationWord($contents);
    }


    /*
    $words = array_map(function (array $wordContent): TransliterationWord {
      error_log(json_encode($wordContent));
      /*
      error_log(join(", ", array_keys($wordContent)));
      $wordIndex = $wordContent['word_index'];
      error_log($wordIndex . ' :: ' . $wordContent[$wordIndex]);
      *(/

      $content = array_map(function (array $contentArray): TransliterationWordContent {

        return new StringContent(new StringContentTypeEnum('Hittite'), '');
      }, $wordContent);

      return new TransliterationWord($content);

    }, $wordContents);
*/

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
