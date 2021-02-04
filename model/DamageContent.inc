<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MyCLabs\Enum\Enum;

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

  function getType(): string {
    return $this->type->getValue();
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