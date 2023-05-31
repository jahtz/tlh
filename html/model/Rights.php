<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\EnumType;

class Rights
{
  static EnumType $graphQLType;
}

Rights::$graphQLType = new EnumType([
  'name' => 'Rights',
  'values' => ['Author', 'Reviewer', 'ExecutiveEditor']
]);
