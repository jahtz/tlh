<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../sql_queries.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/ManuscriptIdentifier.php';
require_once __DIR__ . '/AllTransliterations.php';
require_once __DIR__ . '/AbstractManuscript.php';


use Exception;
use GraphQL\Type\Definition\{InputObjectType, Type};
use mysqli_stmt;
use function sql_helpers\execute_query_with_connection;

class ManuscriptInput extends AbstractManuscript
{
  static InputObjectType $graphQLInputObjectType;

  /** @var ManuscriptIdentifier[] | null */
  public ?array $otherIdentifiers;
  /** @deprecated */
  public string $status;

  function __construct(
    ManuscriptIdentifier $mainIdentifier,
    ?array               $otherIdentifiers,
    string               $palaeographicClassification,
    bool                 $palaeographicClassificationSure,
    ?string              $provenance,
    ?int                 $cthClassification,
    ?string              $bibliography,
    string               $status,
    string               $creatorUsername
  )
  {
    parent::__construct($mainIdentifier, $palaeographicClassification, $palaeographicClassificationSure, $provenance, $cthClassification, $bibliography, $creatorUsername);
    $this->otherIdentifiers = $otherIdentifiers;
    $this->status = $status;
  }

  static function fromGraphQLInput(array $input, string $creatorUsername): ManuscriptInput
  {
    return new ManuscriptInput(
      ManuscriptIdentifier::fromGraphQLInput($input['mainIdentifier']),
      array_key_exists('otherIdentifiers', $input)
        ? array_map(fn(array $x): ManuscriptIdentifier => ManuscriptIdentifier::fromGraphQLInput($x), $input['otherIdentifiers'])
        : null,
      $input['palaeographicClassification'],
      $input['palaeographicClassificationSure'],
      $input['provenance'] ?? null,
      $input['cthClassification'] ?? null,
      $input['bibliography'] ?? null,
      'InCreation',
      $creatorUsername
    );
  }

  function insert(): bool
  {
    $db = connect_to_db();

    $db->begin_transaction();

    # insert main data
    try {
      execute_query_with_connection(
        $db,
        "
insert into tlh_dig_manuscript_metadatas (main_identifier, main_identifier_type, palaeo_classification, palaeo_classification_sure, provenance, cth_classification, bibliography,  creator_username)
values (?, ?, ?, ?, ?, ?, ?, ?);",
        fn(mysqli_stmt $mainInsertStatement) => $mainInsertStatement->bind_param(
          'sssisiss',
          $this->mainIdentifier->identifier, $this->mainIdentifier->identifierType, $this->palaeographicClassification, $this->palaeographicClassificationSure,
          $this->provenance, $this->cthClassification, $this->bibliography, $this->creatorUsername
        ),
        fn(mysqli_stmt $_stmt) => null
      );
    } catch (Exception $e) {
      $db->rollback();
      $db->close();
      return false;
    }

    # insert other identifiers

    $mainIdentifier = $this->mainIdentifier->identifier;

    $otherIdentifierInsertStatement = $db->prepare("
insert into tlh_dig_manuscript_other_identifiers (main_identifier, identifier, identifier_type)
values (?, ?, ?)");

    if (!$otherIdentifierInsertStatement) {
      error_log('Could not prepare insert statements: ' . $db->error);
      return false;
    }

    $allOtherIdentifiersInserted = true;

    foreach ($this->otherIdentifiers as $identifier) {
      $otherIdentifierInsertStatement->bind_param('sss', $mainIdentifier, $identifier->identifier, $identifier->identifierType);

      if (!$otherIdentifierInsertStatement->execute()) {
        error_log("Could not insert other identifier " . json_encode($identifier) . " into database: " . $otherIdentifierInsertStatement->error);

        $allOtherIdentifiersInserted = false;
        break;
      }
    }

    $otherIdentifierInsertStatement->close();

    if (!$allOtherIdentifiersInserted) {
      $db->rollback();
    } else {
      $db->commit();
    }

    $db->close();
    return $allOtherIdentifiersInserted;
  }
}

// GraphQL

ManuscriptInput::$graphQLInputObjectType = new InputObjectType([
  'name' => 'ManuscriptMetaDataInput',
  'fields' => [
    'mainIdentifier' => Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType),
    'otherIdentifiers' => Type::nonNull(Type::listOf(Type::nonNull(ManuscriptIdentifier::$graphQLInputObjectType))),
    'palaeographicClassification' => Type::nonNull(AbstractManuscript::$palaeographicClassificationGraphQLEnumType),
    'palaeographicClassificationSure' => Type::nonNull(Type::boolean()),
    'provenance' => Type::string(),
    'cthClassification' => Type::int(),
    'bibliography' => Type::string(),
  ]
]);
