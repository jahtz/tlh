<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

class PalaeographicClassification extends Enum
{
  static EnumType $graphQLEnumType;

  const OldScript = 'OldScript';
  const MiddleScript = 'MiddleScript';
  const NewScript = 'NewScript';
  const LateNewScript = 'LateNewScript';
  const OldAssyrianScript = 'OldAssyrianScript';
  const MiddleAssyrianScript = 'MiddleAssyrianScript';
  const MiddleBabylonianScript = 'MiddleBabylonianScript';
  const AssyroMittanianScript = 'AssyroMittanianScript';
  const Unclassified = 'Unclassified';
}

PalaeographicClassification::$graphQLEnumType = new EnumType([
  'name' => 'PalaeographicClassification',
  'values' => [
    'OldScript', 'MiddleScript', 'NewScript', 'LateNewScript', 'OldAssyrianScript', 'MiddleAssyrianScript',
    'MiddleBabylonianScript', 'AssyroMittanianScript', 'Unclassified'
  ]
]);