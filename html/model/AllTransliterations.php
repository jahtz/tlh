<?php

namespace model;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/Review.php';

class AllTransliterations
{
  static ObjectType $graphQLType;

  public ?string $provisionalInput;
  public ?string $initialInput;
  public ?Review $firstReview;
  public ?Review $secondReview;
  public ?Review $approvalReview;

  function __construct(
    ?string $provisionalInput,
    ?string $initialInput,
    ?Review $firstReview,
    ?Review $secondReview,
    ?Review $approvalReview
  )
  {
    $this->provisionalInput = $provisionalInput;
    $this->initialInput = $initialInput;
    $this->firstReview = $firstReview;
    $this->secondReview = $secondReview;
    $this->approvalReview = $approvalReview;
  }
}

AllTransliterations::$graphQLType = new ObjectType([
  'name' => 'AllTransliterations',
  'fields' => [
    'provisionalInput' => Type::string(),
    'initialInput' => Type::string(),
    'firstReview' => Review::$graphQLType,
    'secondReview' => Review::$graphQLType,
    'approvalReview' => Review::$graphQLType
  ]
]);