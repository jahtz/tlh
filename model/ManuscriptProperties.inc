<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

class ManuscriptSide extends Enum
{
  static EnumType $graphQLEnumType;

  const NotIdentifiable = 'NotIdentifiable';
  const Obverse = 'Obverse';
  const Reverse = 'Reverse';
  const LowerEdge = 'LowerEdge';
  const UpperEdge = 'UpperEdge';
  const LeftEdge = 'LeftEdge';
  const RightEdge = 'RightEdge';
  const SideA = 'SideA';
  const SideB = 'SideB';
  const InscriptionNumber = 'InscriptionNumber';
  const SealInscription = 'SealInscription';

}

ManuscriptSide::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptSide',
  'values' => ManuscriptSide::keys()
]);

class ManuscriptColumn extends Enum
{
  static EnumType $graphQLEnumType;

  const None = 'None';
  const I = 'I';
  const II = 'II';
  const III = 'III';
  const IV = 'IV';
  const V = 'V';
  const VI = 'VI';
  const VII = 'VII';
  const VIII = 'VIII';
  const IX = 'IX';
  const X = 'X';
  const XI = 'XI';
  const XII = 'XII';
  const LeftColumn = 'LeftColumn';
  const MiddleColumn = 'MiddleColumn';
  const RightColumn = 'RightColumn';
  const ColumnDivider = 'ColumnDivider';

}

class ManuscriptColumnModifier extends Enum
{
  static EnumType $graphQLEnumType;

  const None = 'None';
  const Slash = 'Slash';
  const SlashQuestion = 'SlashQuestion';
}

ManuscriptColumnModifier::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptColumnModifier',
  'values' => ManuscriptColumnModifier::keys()
]);

ManuscriptColumn::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptColumn',
  'values' => ManuscriptColumn::keys()
]);

class ManuscriptLanguage extends Enum
{
  static EnumType $graphQLEnumType;

  const Hittite = 'Hittite';
  const Luwian = 'Luwian';
  const Palaic = 'Palaic';
  const Hattic = 'Hattic';
  const Hurrian = 'Hurrian';
  const Akkadian = 'Akkadian';
  const Sumerian = 'Sumerian';
  const NotIdentifiable = 'NotIdentifiable';

}

ManuscriptLanguage::$graphQLEnumType = new EnumType([
  'name' => 'ManuscriptLanguage',
  'values' => ManuscriptLanguage::keys()
]);