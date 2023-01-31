<?php

namespace model;

use GraphQL\Type\Definition\EnumType;

class ManuscriptSide
{
  static EnumType $graphQLType;
}


ManuscriptSide::$graphQLType = new EnumType([
  'name' => 'ManuscriptSide',
  'values' => [
    'NotIdentifiable', 'Obverse', 'Reverse', 'LowerEdge', 'UpperEdge', 'LeftEdge', 'RightEdge',
    'SideA', 'SideB', 'InscriptionNumber', 'SealInscription'
  ]
]);
