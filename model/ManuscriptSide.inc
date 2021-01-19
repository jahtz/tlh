<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

class ManuscriptSide extends Enum
{
  static /* GraphQLEnum */
    $graphQLEnumType;

  const Front = 'Front';
  const Back = 'Back';
  const LeftEdge = 'LeftEdge';
  const RightEdge = 'RightEdge';
  const UpperEdge = 'UpperEdge';
  const LowerEdge = 'LowerEdge';
}

ManuscriptSide::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptSide',
  'values' => ['Front', 'Back', 'LeftEdge', 'RightEdge', 'UpperEdge', 'LowerEdge']
]);
