<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};
use MyCLabs\Enum\Enum;

class DamageType extends Enum
{
  static EnumType $enumType;

  private const DeletionStart = 'DeletionStart'; // [
  private const DeletionEnd = 'DeletionEnd'; // ]
  private const LesionStart = 'LesionStart'; // ⸢
  private const LesionEnd = 'LesionEnd'; // ⸣
  private const Rasure = 'Rasure'; // *
  private const SurplusStart = 'SurplusStart';
  private const SurplusEnd = 'SurplusEnd';
  private const SupplementStart = 'SupplementStart';
  private const SupplementEnd = 'SupplementEnd';
  private const UnknownDamageStart = 'UnknownDamageStart';
  private const UnknownDamageEnd = 'UnknownDamageEnd';
}

DamageType::$enumType = new EnumType([
  'name' => 'DamageType',
  'values' => DamageType::keys()
]);

class DamageContent extends TransliterationWordContent
{
  const jsonTypeName = 'damage';

  static ObjectType $graphQLObjectType;

  public DamageType $damageType;

  public function __construct(DamageType $damageType) {
    parent::__construct('');
    $this->damageType = $damageType;
  }

  static function readFromGraphQLInput(string $input): DamageContent {
    return new DamageContent(new DamageType($input));
  }

  function graphQLType(): ObjectType {
    return DamageContent::$graphQLObjectType;
  }

  static function fromJson(array $wordContent): DamageContent {
    return new DamageContent(new DamageType($wordContent['damageType']));
  }

  function toJson(): array {
    return [
      '_type' => DamageContent::jsonTypeName,
      'damageType' => $this->damageType->getValue()
    ];
  }
}

DamageContent::$graphQLObjectType = new ObjectType([
  'name' => 'DamageContent',
  'fields' => [
    'type' => [
      'type' => Type::nonNull(DamageType::$enumType),
      'resolve' => fn(DamageContent $damageContent) => $damageContent->damageType->getValue()
    ]
  ]
]);