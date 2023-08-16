<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\EnumType;

class Rights
{
  const Author = 'Author';
  const Reviewer = 'Reviewer';
  const ExecutiveEditor = 'ExecutiveEditor';

  static EnumType $graphQLType;
}

Rights::$graphQLType = new EnumType([
  'name' => 'Rights',
  'values' => [Rights::Author, Rights::Reviewer, Rights::ExecutiveEditor]
]);
