<?php

namespace model;

require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/Rights.php';
require_once __DIR__ . '/User.php';
require_once __DIR__ . '/Manuscript.php';
require_once __DIR__ . '/DocumentInPipeline.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;
use mysqli_stmt;
use function sql_helpers\executeSingleChangeQuery;

class ExecutiveEditor
{
  static ObjectType $executiveEditorQueryType;
  static ObjectType $mutationsType;

  static function updateRights(string $username, string $newRights): bool
  {
    return executeSingleChangeQuery(
      "update tlh_dig_users set rights = ? where username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $newRights, $username)
    );
  }

  static function insertReviewerAppointmentForReleasedTransliteration(string $mainIdentifier, string $reviewer, string $appointedBy): string
  {
    return executeSingleChangeQuery(
      "
insert into tlh_dig_transliteration_review_appointments (main_identifier, username, appointed_by_username)
values (?, ?, ?)
on duplicate key update username = ?, appointed_by_username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $mainIdentifier, $reviewer, $appointedBy, $reviewer, $appointedBy)
    );
  }
}

ExecutiveEditor::$executiveEditorQueryType = new ObjectType([
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
      'resolve' => fn(User $user, array $args): array => DocumentInPipeline::selectDocumentsInPipeline($args['page'] ?? 0)
    ],
    'releasedTransliterationsWithoutAppointedReviewer' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(): ?array => Manuscript::releasedTransliterationsWithoutAppointedReviewer()
    ]
  ]
]);

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

        if (ExecutiveEditor::updateRights($args['username'], $newRights)) {
          return $newRights;
        } else {
          throw new MySafeGraphQLException("Could not change rights for user $username to $newRights");
        }
      }
    ],
    'appointReviewerForReleasedTransliteration' => [
      'type' => Type::nonNull(Type::string()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'reviewer' => Type::nonNull(Type::string()),
      ],
      'resolve' => function (User $user, array $args): string {
        $mainIdentifier = $args['mainIdentifier'];
        $reviewerUsername = $args['reviewer'];

        //  make sure that reviewer exists and has review rights
        $reviewer = User::selectUserFromDatabase($reviewerUsername);
        if (is_null($reviewer)) {
          throw new MySafeGraphQLException("Can't appoint non-existing user $reviewerUsername as reviewer!");
        }
        if (!$reviewer->isReviewer()) {
          throw new MySafeGraphQLException("User $reviewer->username hasn't got reviewer rights!");
        }

        // check that reviewer is not owner of manuscript!

        $manuscript = Manuscript::selectManuscriptById($mainIdentifier);
        if (is_null($manuscript)) {
          throw new MySafeGraphQLException("Can't appoint reviewer for non-existing manuscript $mainIdentifier!");
        }
        if ($manuscript->creatorUsername === $reviewerUsername) {
          throw new MySafeGraphQLException("User $reviewerUsername can't review own manuscript!");
        }

        return ExecutiveEditor::insertReviewerAppointmentForReleasedTransliteration($mainIdentifier, $reviewer->username, $user->username);
      }
    ]
  ]
]);