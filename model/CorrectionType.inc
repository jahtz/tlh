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
  private const DoubleParagraphEnd = 'DoubleParagraphEnd';

}

CorrectionType::$enumType = new EnumType([
  'name' => 'CorrectionType',
  'values' => CorrectionType::keys()
]);

class CorrectionContent extends TransliterationWordContent
{
  const jsonTypeName = 'correction';

  static ObjectType $graphQLObjectType;

  public CorrectionType $correctionType;

  public function __construct(CorrectionType $correctionType) {
    parent::__construct('');
    $this->correctionType = $correctionType;
  }

  static function readFromGraphQLInput(string $type): CorrectionContent {
    return new CorrectionContent(new CorrectionType($type));
  }

  function graphQLType(): ObjectType {
    return CorrectionContent::$graphQLObjectType;
  }

  static function fromJson(array $wordContent): CorrectionContent {
    return new CorrectionContent(new CorrectionType($wordContent['correctionType']));
  }

  function toJson(): array {
    return [
      '_type' => CorrectionContent::jsonTypeName,
      'correctionType' => $this->correctionType->getValue()
    ];
  }
}

CorrectionContent::$graphQLObjectType = new ObjectType([
  'name' => 'CorrectionContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(CorrectionType::$enumType),
      'resolve' => fn(CorrectionContent $correctionContent) => $correctionContent->correctionType->getValue()
    ]
  ]
]);