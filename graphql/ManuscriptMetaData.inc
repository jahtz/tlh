<?php

namespace tlh_dig\graphql;

require_once __DIR__ . '/ManuscriptStatus.php';

use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

/**
 * @param int $manuscriptId
 * @return string[]
 */
function getPictures(int $manuscriptId): array {
  $folder = "./uploads/$manuscriptId/";
  if (file_exists($folder) && is_dir($folder)) {
    return array_filter(
      scandir($folder),
      function (string $value): bool {
        return !in_array($value, ['.', '..']);
      }
    );
  } else {
    return [];
  }
}

$datingType = new EnumType([
  'name' => 'Dating',
  'values' => ['jh', 'ah']
]);

class ManuscriptMetaData
{

  static /*ObjectType*/
    $graphQLType;


  public /*int*/
    $id;
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
  public /*int*/
    $statusId;
  public /*string*/
    $creatorUsername;

  function __construct(
    int $id,
    string $identifiers,
    string $dating,
    ?string $provenance,
    ?string $cthClassification,
    ?string $bibliography,
    int $statusId,
    string $creatorUsername
  ) {
    $this->id = $id;
    $this->identifiers = $identifiers;
    $this->dating = $dating;
    $this->provenance = $provenance;
    $this->cthClassification = $cthClassification;
    $this->bibliography = $bibliography;
    $this->statusId = $statusId;
    $this->creatorUsername = $creatorUsername;
  }

  static function fromDbAssocArray(array $row): ManuscriptMetaData {
    return new ManuscriptMetaData(
      $row['id'],
      $row['identifiers'],
      $row['dating'],
      $row['provenance'],
      $row['cth_classification'],
      $row['bibliography'],
      $row['status_id'],
      $row['creator_username']
    );
  }
}

ManuscriptMetaData::$graphQLType = new ObjectType([
  'name' => 'ManuscriptMetaData',
  'fields' => [
    'id' => Type::nonNull(Type::int()),
    'identifiers' => Type::nonNull(Type::string()),
    'dating' => Type::nonNull($datingType),
    'provenance' => Type::string(),
    'cthClassification' => Type::string(),
    'bibliography' => Type::string(),
    'creatorUsername' => Type::nonNull(Type::string()),
    'status' => [
      'type' => ManuscriptStatus::$enumType,
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): ?int {
        return $manuscriptMetaData->statusId;
      }
    ],
    'pictureUrls' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => function (ManuscriptMetaData $manuscriptMetaData): array {
        return getPictures($manuscriptMetaData->id);
      }
    ]
  ]
]);
