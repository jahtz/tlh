<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\EnumType;

abstract class ManuscriptStatus
{
  static EnumType $graphQLType;

  const created = 'Created';
  const transliterationReleased = 'TransliterationReleased';
  const transliterationReviewed = 'TransliterationReviewPerformed';
  const xmlConversionPerformed = 'XmlConversionPerformed';
  const firstXmlReviewPerformed = 'FirstXmlReviewPerformed';
  const secondXmlReviewed = 'SecondXmlReviewPerformed';
  const approved = 'Approved';
}

ManuscriptStatus::$graphQLType = new EnumType([
  'name' => 'ManuscriptStatus',
  'values' => [
    ManuscriptStatus::created,
    ManuscriptStatus::transliterationReleased,
    ManuscriptStatus::transliterationReviewed,
    ManuscriptStatus::xmlConversionPerformed,
    ManuscriptStatus::firstXmlReviewPerformed,
    ManuscriptStatus::secondXmlReviewed,
    ManuscriptStatus::approved
  ]
]);
