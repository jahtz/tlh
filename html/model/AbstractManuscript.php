<?php

namespace model;

use GraphQL\Type\Definition\EnumType;

abstract class AbstractManuscript
{
  static EnumType $palaeographicClassificationGraphQLEnumType;

  public ManuscriptIdentifier $mainIdentifier;
  public string $palaeographicClassification;
  public bool $palaeographicClassificationSure;
  public string $defaultLanguage;
  public ?string $provenance;
  public ?int $cthClassification;
  public ?string $bibliography;
  public string $creatorUsername;

  public function __construct(
    ManuscriptIdentifier $mainIdentifier,
    string               $palaeographicClassification,
    bool                 $palaeographicClassificationSure,
    string               $defaultLanguage,
    ?string              $provenance,
    ?int                 $cthClassification,
    ?string              $bibliography,
    string               $creatorUsername
  )
  {
    $this->mainIdentifier = $mainIdentifier;
    $this->palaeographicClassification = $palaeographicClassification;
    $this->palaeographicClassificationSure = $palaeographicClassificationSure;
    $this->defaultLanguage = $defaultLanguage;
    $this->provenance = $provenance;
    $this->cthClassification = $cthClassification;
    $this->bibliography = $bibliography;
    $this->creatorUsername = $creatorUsername;
  }
}

AbstractManuscript::$palaeographicClassificationGraphQLEnumType = new EnumType([
  'name' => 'PalaeographicClassification',
  'values' => [
    'OldScript', 'MiddleScript', 'NewScript', 'LateNewScript', 'OldAssyrianScript', 'MiddleBabylonianScript',
    'MiddleAssyrianScript', 'AssyroMittanianScript', 'Unclassified']
]);