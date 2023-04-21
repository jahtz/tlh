<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\{ObjectType, Type};

class ManuscriptLanguage
{
  static ObjectType $graphQLType;

  public string $name;
  public string $abbreviation;

  function __construct(string $name, string $abbreviation)
  {
    $this->name = $name;
    $this->abbreviation = $abbreviation;
  }
}

ManuscriptLanguage::$graphQLType = new ObjectType([
  'name' => 'ManuscriptLanguage',
  'fields' => [
    'name' => Type::nonNull(Type::string()),
    'abbreviation' => Type::nonNull(Type::string()),
  ]
]);

function allManuscriptLanguages(): array
{
  return [
    new ManuscriptLanguage('Hittite', 'Hit'),
    new ManuscriptLanguage('Luwian', 'Luw'),
    new ManuscriptLanguage('Palaic', 'Pal'),
    new ManuscriptLanguage('Hattic', 'Hat'),
    new ManuscriptLanguage('Hurrian', 'Hur'),
    new ManuscriptLanguage('Akkadian', 'Akk'),
    new ManuscriptLanguage('Sumerian', 'Sum')
  ];
}