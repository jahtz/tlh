<?php

namespace tlh_dig\graphql;

require_once __DIR__ . '/ManuscriptMetaData.inc';

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;

class ManuscriptMetaDataInput
{

  static /*InputObjectType*/
    $graphQLInputObjectType;

  public /*ManuscriptIdentifier*/
    $mainIdentifier;
  public /*string*/
    $dating;
  public /*?string*/
    $provenance;
  public /*?string*/
    $cthClassification;
  public /*?string*/
    $bibliography;
  public /*string*/
    $creatorUsername;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    string $dating,
    ?string $provenance,
    ?string $cthClassification,
    ?string $bibliography,
    string $creatorUsername
  ) {
    $this->mainIdentifier = $mainIdentifier;
    $this->dating = $dating;
    $this->provenance = $provenance;
    $this->cthClassification = $cthClassification;
    $this->bibliography = $bibliography;
    $this->creatorUsername = $creatorUsername;
  }

  public static function fromGraphQLArray(array $values, string $creatorUsername): ManuscriptMetaDataInput {
    return new ManuscriptMetaDataInput(
      ManuscriptIdentifier::new($values['mainIdentifier'], $values['mainIdentifierType']),
      $values['dating'],
      $values['provenance'],
      $values['cthClassification'],
      $values['bibliography'],
      $creatorUsername
    );
  }
}

ManuscriptMetaDataInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptMetaDataInput',
  'fields' => [
    'mainIdentifier' => Type::nonNull(Type::string()),
    'mainIdentifierType' => Type::nonNull(ManuscriptIdentifierType::$graphQLEnumType),
    'palaeographicClassification' => Type::nonNull(PalaeographicClassification::$graphQLEnumType),
    'provenance' => Type::string(),
    'cthClassification' => Type::string(),
    'bibliography' => Type::string(),
  ]
]);