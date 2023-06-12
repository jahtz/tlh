<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';

use GraphQL\Type\Definition\{EnumType, ObjectType, Type};

class ManuscriptLanguage
{
  /** @deprecated */
  static ObjectType $graphQLType;
  static EnumType $enumType;

  const hit = 'Hit';
  const luw = 'Luw';
  const pal = 'Pal';
  const hat = 'Hat';
  const hur = 'Hur';
  const akk = 'Akk';
  const sum = 'Sum';

  /** @deprecated */
  public string $name;
  /** @deprecated */
  public string $abbreviation;

  /** @deprecated */
  function __construct(string $name, string $abbreviation)
  {
    $this->name = $name;
    $this->abbreviation = $abbreviation;
  }
}

/** @deprecated */
ManuscriptLanguage::$graphQLType = new ObjectType([
  'name' => 'ManuscriptLanguage',
  'fields' => [
    'name' => Type::nonNull(Type::string()),
    'abbreviation' => Type::nonNull(Type::string()),
  ]
]);

ManuscriptLanguage::$enumType = new EnumType([
  'name' => 'ManuscriptLanguageAbbreviations',
  'values' => [
    ManuscriptLanguage::hit, ManuscriptLanguage::luw, ManuscriptLanguage::pal, ManuscriptLanguage::hat,
    ManuscriptLanguage::hur, ManuscriptLanguage::akk, ManuscriptLanguage::sum
  ]
]);

/** @deprecated */
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