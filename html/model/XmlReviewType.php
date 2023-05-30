<?php

namespace model;

use GraphQL\Type\Definition\EnumType;

require_once __DIR__ . '/../vendor/autoload.php';

abstract class XmlReviewType
{
  static EnumType $graphQLType;

  const firstXmlReview = 'FirstXmlReview';
  const secondXmlReview = 'SecondXmlReview';
}

XmlReviewType::$graphQLType = new EnumType([
  'name' => 'XmlReviewType',
  'values' => [
    XmlReviewType::firstXmlReview,
    XmlReviewType::secondXmlReview,
  ]
]);