<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MyCLabs\Enum\Enum;

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

  protected function getType(): string {
    return $this->type->getValue();
  }

  function graphQLType(): ObjectType {
    return CorrectionContent::$graphQLObjectType;
  }
}

CorrectionContent::$graphQLObjectType = new ObjectType([
  'name' => 'CorrectionContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(CorrectionType::$enumType),
      'resolve' => fn(CorrectionContent $correctionContent) => $correctionContent->type->getValue()
    ]
  ]
]);