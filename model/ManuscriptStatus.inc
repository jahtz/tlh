<?php

namespace tlh_dig\model;

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
  static EnumType $enumType;

  private const InCreation = 'InCreation';
  private const Created = 'Created';
  private const Reviewed = 'Reviewed';
  private const ReviewMerged = 'ReviewMerged';
  private const ExecutiveReviewed = 'ExecutiveReviewed';
  private const ExecutiveReviewMerged = 'ExecutiveReviewMerged';
  private const Approved = 'Approved';
}

ManuscriptStatus::$enumType = new EnumType([
  'name' => 'ManuscriptStatus',
  'values' => ManuscriptStatus::keys()
]);
