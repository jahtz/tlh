<?php

namespace model;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

require_once __DIR__ . '/../vendor/autoload.php';

class Review
{
  static ObjectType $graphQLType;

  public string $reviewerUsername;
  public string $input;

  function __construct(string $reviewerUsername, string $input)
  {
    $this->reviewerUsername = $reviewerUsername;
    $this->input = $input;
  }
}

Review::$graphQLType = new ObjectType([
  'name' => 'Review',
  'fields' => [
    'reviewerUsername' => Type::nonNull(Type::string()),
    'input' => Type::nonNull(Type::string()),
  ]
]);