<?php

namespace tlh_dig\model;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

class CorrectionType extends Enum
{
  static /* EnumType */
    $enumType;

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
