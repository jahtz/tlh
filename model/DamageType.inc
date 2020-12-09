<?php

use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use MyCLabs\Enum\Enum;

class DamagePosition extends Enum
{

  static /* EnumType */
    $enumType;

  const Start = 'Start';
  const End = 'End';

}

DamagePosition::$enumType = new EnumType([
  'name' => 'DamagePositionEnum',
  'values' => [
    'Start' => ['value' => DamagePosition::Start],
    'End' => ['value' => DamagePosition::End]
  ]
]);

class DamageType extends Enum
{
  static /* EnumType */
    $enumType;
}

DamageType::$enumType = new EnumType([
  'name' => 'DamageTypeEnum',
  'values' => ['Deletion', 'Lesion', 'Rasure', 'Surplus', 'Supplement', 'UnknownDamage']
]);

class Damage
{
  static /* InputObjectType */
    $graphQLInputObjectType;

  public /* DamageType */
    $type;
  public /* DamagePosition */
    $position;

  function __construct(DamageType $type, DamagePosition $position) {
    $this->type = $type;
    $this->position = $position;
  }
}

Damage::$graphQLInputObjectType = new InputObjectType([
  'name' => 'DamageInput',
  'fields' => [
    'type' => Type::nonNull(DamageType::$enumType),
    'position' => Type::nonNull(DamagePosition::$enumType)
  ]
]);