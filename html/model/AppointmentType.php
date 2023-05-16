<?php

namespace model;

use GraphQL\Type\Definition\EnumType;

require_once __DIR__ . '/../vendor/autoload.php';

class AppointmentType
{
  const transliterationReview = 'TransliterationReview';
  const xmlConversion = 'XmlConversion';

  static EnumType $enumType;
}

AppointmentType::$enumType = new EnumType([
  'name' => 'AppointmentType',
  'values' => [AppointmentType::transliterationReview, AppointmentType::xmlConversion]
]);