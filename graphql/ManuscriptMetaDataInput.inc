<?php

namespace tlh_dig\graphql;

require_once __DIR__ . '/ManuscriptMetaData.inc';

/**
 * @var $datingType - set in ManuscriptMetaData.inc
 */

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;

class ManuscriptMetaDataInput
{

  static /*InputObjectType*/
    $graphQLInputObjectType;

  public /*string*/
    $identifiers;
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
    string $identifiers,
    string $dating,
    ?string $provenance,
    ?string $cthClassification,
    ?string $bibliography,
    string $creatorUsername
  ) {
    $this->identifiers = $identifiers;
    $this->dating = $dating;
    $this->provenance = $provenance;
    $this->cthClassification = $cthClassification;
    $this->bibliography = $bibliography;
    $this->creatorUsername = $creatorUsername;
  }

  public static function fromGraphQLArray(array $values, string $creatorUsername): ManuscriptMetaDataInput {
    return new ManuscriptMetaDataInput(
      $values['identifiers'],
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
    'identifiers' => Type::nonNull(Type::string()),
    'dating' => Type::nonNull($datingType),
    'provenance' => Type::string(),
    'cthClassification' => Type::string(),
    'bibliography' => Type::string(),
  ]
]);