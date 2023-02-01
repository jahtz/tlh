<?php

namespace model;

use GraphQL\Type\Definition\{ObjectType, Type};

const nameName = 'name';
const abbreviationName = 'abbreviation';

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
    nameName => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(ManuscriptLanguage $language): string => $language->name
    ],
    abbreviationName => [
      'type' => Type::nonNull(Type::string()),
      'resolve' => fn(ManuscriptLanguage $language): string => $language->abbreviation
    ]
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