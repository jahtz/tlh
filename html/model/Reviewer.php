<?php

namespace model;

require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/../sql_helpers.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleChangeQuery, executeSingleSelectQuery};

class Reviewer
{
  static ObjectType $queryType;
  static ObjectType $mutationType;

  // TODO: make subclass of User?

  /** @return string[] */
  static function selectUnfinishedTransliterationReviewAppointments(string $username): array
  {
    // FIXME: check that review isn't done yet!
    return executeMultiSelectQuery(
      "
select appointment.main_identifier
    from tlh_dig_transliteration_review_appointments as appointment
    left outer join tlh_dig_transliteration_reviews as review on review.main_identifier = appointment.main_identifier
    where username = ? and review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row) => $row['main_identifier']
    );
  }

  static function selectTransliterationReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    return executeSingleSelectQuery(
      "
select transliteration.input
    from tlh_dig_transliteration_review_appointments as appointment
    join tlh_dig_released_transliterations as released on appointment.main_identifier = released.main_identifier
    join tlh_dig_provisional_transliterations as transliteration on released.main_identifier = transliteration.main_identifier
    where appointment.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }

  static function insertTransliterationReview(string $mainIdentifier, string $reviewerUsername, string $input): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_transliteration_reviews (main_identifier, reviewer_username, input) values (?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $reviewerUsername, $input),
    );
  }
}

Reviewer::$queryType = new ObjectType([
  'name' => 'Reviewer',
  'fields' => [
    'reviewAppointments' => [
      // TODO: rename to transliterationReviewAppointments?
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(User $user): array => Reviewer::selectUnfinishedTransliterationReviewAppointments($user->username)
    ],
    'transliterationReview' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => Reviewer::selectTransliterationReviewAppointment($args['mainIdentifier'], $user->username)
    ]
  ]
]);

Reviewer::$mutationType = new ObjectType([
  'name' => 'ReviewerMutations',
  'fields' => [
    'submitTransliterationReview' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'review' => Type::nonNull(Type::string()),
      ],
      'resolve' => fn(User $user, array $args): bool => Reviewer::insertTransliterationReview($args['mainIdentifier'], $user->username, $args['review'])
    ]
  ]
]);