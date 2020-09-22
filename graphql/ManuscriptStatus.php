<?php

namespace tlh_dig\graphql;

use GraphQL\Type\Definition\EnumType;
use MyCLabs\Enum\Enum;

/**
 * Class ManuscriptStatus
 * @package tlh_dig\graphql
 *
 * @method static ManuscriptStatus InCreation()
 * @method static ManuscriptStatus Created()
 * @method static ManuscriptStatus Reviewed()
 * @method static ManuscriptStatus ReviewMerged()
 * @method static ManuscriptStatus ExecutiveReviewed()
 * @method static ManuscriptStatus ExecutiveReviewMerged()
 * @method static ManuscriptStatus Approved()
 */
class ManuscriptStatus extends Enum
{

  static /*EnumType*/
    $enumType;

  private const InCreation = 0;
  private const Created = 1;
  private const Reviewed = 2;
  private const ReviewMerged = 3;
  private const ExecutiveReviewed = 4;
  private const ExecutiveReviewMerged = 5;
  private const Approved = 6;

}

ManuscriptStatus::$enumType = new EnumType([
  'name' => 'ManuscriptStatus',
  'values' => [
    'InCreation' => ['value' => 0],
    'Created' => ['value' => 1],
    'Reviewed' => ['value' => 2],
    'ReviewMerged' => ['value' => 3],
    'ExecutiveReviewed' => ['value' => 4],
    'ExecutiveReviewMerged' => ['value' => 5],
    'Approved' => ['value' => 6]
  ]
]);