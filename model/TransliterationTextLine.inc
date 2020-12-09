<?php


namespace tlh_dig\graphql;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/DamageType.inc';
require_once __DIR__ . '/StringContent.inc';
require_once __DIR__ . '/CorrectionType.inc';

use Damage;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use tlh_dig\model\CorrectionType;
use tlh_dig\model\StringContent;

abstract class TransliterationTextLineContent
{
  static /* InputObjectType */
    $graphQLInputType;

}

TransliterationTextLineContent::$graphQLInputType = new InputObjectType([
  'name' => 'TransliterationTextLineContentUnion',
  'fields' => [
    'stringContent' => StringContent::$graphQLInputType,
    'damageContent' => Damage::$graphQLInputObjectType,
    'correctionContent' => CorrectionType::$enumType,
  ]
]);


class TransliterationTextLine
{

  static $graphQLInputType;

  public /* int */
    $lineNumber;

  public /* bool */
    $isAbsolute;

  public /* array */
    $content;

  function __construct(int $lineNumber, bool $isAbsolute, array $content) {
    $this->lineNumber = $lineNumber;
    $this->isAbsolute = $isAbsolute;
    $this->content = $content;
  }
}

TransliterationTextLine::$graphQLInputType = new InputObjectType([
  'name' => 'TransliterationTextLineInput',
  'fields' => [
    'lineNumber' => Type::nonNull(Type::int()),
    'isAbsolute' => Type::nonNull(Type::boolean()),
    // TODO: type of content!
    'content' => Type::nonNull(Type::listOf(Type::nonNull(TransliterationTextLineContent::$graphQLInputType)))
  ]
]);