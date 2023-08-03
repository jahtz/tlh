<?php

namespace model;

require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/Rights.php';
require_once __DIR__ . '/User.php';
require_once __DIR__ . '/Manuscript.php';
require_once __DIR__ . '/DocumentInPipeline.php';

use Exception;
use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

class ExecutiveEditor
{
  static ObjectType $queryType;
  static ObjectType $mutationsType;

  static function updateRights(string $username, string $newRights): bool
  {
    try {
      return SqlHelpers::executeSingleChangeQuery(
        "update tlh_dig_users set rights = ? where username = ?;",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $newRights, $username)
      );
    } catch (Exception $exception) {
      error_log($exception);
      return false;
    }
  }

  /** @return string[] */
  static function selectDocumentsAwaitingApproval(): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "
select second_xml_revs.main_identifier
from tlh_dig_second_xml_reviews as second_xml_revs
    left outer join tlh_dig_approved_transliterations as approved_trans using(main_identifier)
where approved_trans.input is null;",
      null,
      fn(array $row): string => $row['main_identifier']
    );
  }

  static function selectDocumentAwaitingApproval(string $mainIdentifier): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select second_xml_revs.input
from tlh_dig_second_xml_reviews as second_xml_revs
    left outer join tlh_dig_approved_transliterations as approved_trans using(main_identifier)
where approved_trans.input is null and second_xml_revs.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): ?string => $row['input']
    );
  }

  static function selectDocumentApproved(string $mainIdentifier): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_approved_transliterations where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  /** @throws Exception */
  static function insertApproval(string $mainIdentifier, string $xml, string $approvalUsername): bool
  {
    return SqlHelpers::executeQueriesInTransactions(
      function (mysqli $conn) use ($mainIdentifier, $xml, $approvalUsername): bool {
        SqlHelpers::executeSingleChangeQuery(
          "insert into tlh_dig_approved_transliterations (main_identifier, input, approval_username) values (?, ?, ?);",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $approvalUsername),
          $conn
        );

        return SqlHelpers::executeSingleChangeQuery(
          "update tlh_dig_manuscripts set status = 'Approved' where main_identifier = ?;",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
          $conn
        );
      }
    );
  }
}

ExecutiveEditor::$queryType = new ObjectType([
  'name' => 'ExecutiveEditor',
  'fields' => [
    'userCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn(): int => User::selectCount()
    ],
    'users' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(User::$graphQLQueryType))),
      'args' => [
        'page' => Type::nonNull(Type::int())
      ],
      'resolve' => fn(User $_user, array $args): array => User::selectUsersPaginated($args['page'])
    ],
    'allReviewers' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(): array => User::selectAllReviewers()
    ],
    'documentsInPipelineCount' => [
      'type' => Type::nonNull(Type::int()),
      'resolve' => fn() => DocumentInPipeline::selectCount()
    ],
    'documentsInPipeline' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(DocumentInPipeline::$queryType))),
      'args' => [
        'page' => Type::int()
      ],
      'resolve' => fn(User $_user, array $args): array => DocumentInPipeline::selectDocumentsInPipeline($args['page'] ?? 0)
    ],
    'documentsAwaitingApproval' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(User $_user, array $args): array => ExecutiveEditor::selectDocumentsAwaitingApproval()
    ],
    'documentAwaitingApproval' => [
      'type' => TYpe::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $_user, array $args): ?string => ExecutiveEditor::selectDocumentAwaitingApproval($args['mainIdentifier'])
    ]
  ]
]);

/** @throws MySafeGraphQLException */
function resolveReviewer(string $username): User
{
  $user = User::selectUserFromDatabase($username);

  if (is_null($user)) {
    throw new MySafeGraphQLException("User $username doesn't exist!");
  }

  if (!$user->isReviewer()) {
    throw new MySafeGraphQLException("User $user->username is no reviewer!");
  }

  return $user;
}

/**
 * @param string $stepName
 * @param User $executiveEditor
 * @param string $usernameToAppoint
 * @param string $mainIdentifier
 * @param callable(Manuscript):bool $selectStepAlreadyPerformed
 * @param callable(Manuscript,string,string):bool $upsertStepAppointmentData
 *
 * @return bool
 *
 * @throws MySafeGraphQLException
 */
function resolveAppointUser(
  string   $stepName,
  User     $executiveEditor,
  string   $usernameToAppoint,
  string   $mainIdentifier,
  callable $selectStepAlreadyPerformed,
  callable $upsertStepAppointmentData
): bool
{
  $reviewer = resolveReviewer($usernameToAppoint);
  $manuscript = Manuscript::resolveManuscriptById($mainIdentifier);

  // check that transliteration is released
  if (!$manuscript->selectTransliterationIsReleased()) {
    throw new MySafeGraphQLException("Transliteration of manuscript " . $manuscript->mainIdentifier->identifier . " is not yet released!");
  }
  if ($selectStepAlreadyPerformed($manuscript)) {
    throw new MySafeGraphQLException("Step $stepName has already been performed for manuscript " . $manuscript->mainIdentifier->identifier . "!");
  }

  $inserted = $upsertStepAppointmentData($manuscript, $reviewer->username, $executiveEditor->username);

  if (!$inserted) {
    throw new MySafeGraphQLException("Could not update appointment for step $stepName for manuscript " . $manuscript->mainIdentifier->identifier . "!");
  }

  // TODO: check if assignment can be done and tell user!

  mail(
    $reviewer->email,
    "[TLHdig] Assigned for step $stepName of manuscript " . $manuscript->mainIdentifier->identifier,
    "You have been assigned for step $stepName of manuscript " . $manuscript->mainIdentifier->identifier . ".",
  );

  return true;
}

ExecutiveEditor::$mutationsType = new ObjectType([
  'name' => 'ExecutiveEditorMutations',
  'fields' => [
    'updateUserRights' => [
      'type' => Type::nonNull(Rights::$graphQLType),
      'args' => [
        'username' => Type::nonNull(Type::string()),
        'newRights' => Type::nonNull(Rights::$graphQLType),
      ],
      'resolve' => function (User $user, array $args): string {
        $username = $args['username'];
        $newRights = $args['newRights'];

        if (ExecutiveEditor::updateRights($username, $newRights)) {
          return $newRights;
        } else {
          throw new MySafeGraphQLException("Could not change rights for user $username to $newRights");
        }
      }
    ],
    'appointTransliterationReviewer' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'manuscriptIdentifier' => Type::nonNull(Type::string()),
        'reviewer' => Type::nonNull(Type::string()),
      ],
      'resolve' => fn(User $executiveEditor, array $args): string => resolveAppointUser(
        "Transliteration review",
        $executiveEditor,
        $args['reviewer'],
        $args['manuscriptIdentifier'],
        fn(Manuscript $manuscript): bool => $manuscript->selectTransliterationReviewPerformed(),
        fn(Manuscript $manuscript, string $reviewer, string $appointedBy): bool => $manuscript->upsertReviewerAppointmentForReleasedTransliteration($reviewer, $appointedBy)
      )
    ],
    'appointXmlConverter' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'manuscriptIdentifier' => Type::nonNull(Type::string()),
        'converter' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $executiveEditor, array $args): string => resolveAppointUser(
        "Xml conversion",
        $executiveEditor,
        $args['converter'],
        $args['manuscriptIdentifier'],
        fn(Manuscript $manuscript): bool => $manuscript->selectXmlConversionPerformed(),
        fn(Manuscript $manuscript, string $converter, string $appointedBy): bool => $manuscript->upsertXmlConversionAppointment($converter, $appointedBy)
      )
    ],
    'appointFirstXmlReviewer' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'manuscriptIdentifier' => Type::nonNull(Type::string()),
        'reviewer' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $executiveEditor, array $args): string => resolveAppointUser(
        "First xml review",
        $executiveEditor,
        $args['reviewer'],
        $args['manuscriptIdentifier'],
        fn(Manuscript $manuscript): bool => $manuscript->selectFirstXmlReviewPerformed(),
        fn(Manuscript $manuscript, string $reviewer, string $appointedBy): bool => $manuscript->upsertFirstXmlReviewAppointment($reviewer, $appointedBy)
      )
    ],
    'appointSecondXmlReviewer' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'manuscriptIdentifier' => Type::nonNull(Type::string()),
        'reviewer' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $executiveEditor, array $args): string => resolveAppointUser(
        "Second xml review",
        $executiveEditor,
        $args['reviewer'],
        $args['manuscriptIdentifier'],
        fn(Manuscript $manuscript): bool => $manuscript->selectSecondXmlReviewPerformed(),
        fn(Manuscript $manuscript, string $reviewer, string $appointedBy): bool => $manuscript->upsertSecondXmlReviewAppointment($reviewer, $appointedBy),
      )
    ],
    'submitApproval' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'manuscriptIdentifier' => Type::nonNull(Type::string()),
        'input' => Type::nonNull(Type::string())
      ],
      'resolve' => function (User $user, array $args): bool {
        $manuscriptIdentifier = $args['manuscriptIdentifier'];
        $input = $args['input'];

        $manuscript = Manuscript::resolveManuscriptById($manuscriptIdentifier);

        // TODO: check conditions -> not submitted yet...!

        if (!$manuscript->selectSecondXmlReviewPerformed()) {
          throw new MySafeGraphQLException("Second xml review of manuscript $manuscriptIdentifier was not yet performed!");
        }

        if (ExecutiveEditor::selectDocumentApproved($manuscriptIdentifier)) {
          throw new MySafeGraphQLException("Manuscript $manuscriptIdentifier has already been approved!");
        }

        $inserted = ExecutiveEditor::insertApproval($manuscriptIdentifier, $input, $user->username);

        sendMailToAdmins(
          "The Manuscript $manuscriptIdentifier was released",
          "The Manuscript $manuscriptIdentifier was released",
        );

        return $inserted;
      }
    ]
  ]
]);