<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleChangeQuery, executeSingleSelectQuery};

class Reviewer
{
  static ObjectType $queryType;
  static ObjectType $mutationType;

  // TODO: make subclass of User?

  /** @return Appointment[] */
  static function selectUnfinishedTransliterationReviewAppointments(string $username): array
  {
    return executeMultiSelectQuery(
      "
select appointment.main_identifier
    from tlh_dig_transliteration_review_appointments as appointment
    left outer join tlh_dig_transliteration_reviews as review on review.main_identifier = appointment.main_identifier
    where username = ? and review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::transliterationReview, null)
    );
  }

  static function selectTransliterationReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    return executeSingleSelectQuery(
      "
select transliteration.input
from tlh_dig_transliteration_review_appointments as appointment
    join tlh_dig_released_transliterations as released
        on appointment.main_identifier = released.main_identifier
    join tlh_dig_provisional_transliterations as transliteration
        on released.main_identifier = transliteration.main_identifier
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

  /** @return Appointment[] */
  static function selectUnfinishedXmlConversionAppointments(string $username): array
  {
    return executeMultiSelectQuery(
      "
select appointment.main_identifier, review.input is null as blocked
from tlh_dig_xml_conversion_appointments as appointment
  left outer join tlh_dig_xml_conversions as conversion
      on conversion.main_identifier = appointment.main_identifier
  left outer join tlh_dig_transliteration_reviews as review
      on appointment.main_identifier = review.main_identifier
where username = ? and conversion.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::xmlConversion, $row['blocked'] ? AppointmentType::transliterationReview : null)
    );
  }

  static function selectXmlConversionAppointment(string $mainIdentifier, string $username): ?string
  {
    // TODO: check if blocked...
    return executeSingleSelectQuery(
      "
select review.input
from tlh_dig_transliteration_reviews as review
    join tlh_dig_xml_conversion_appointments as appointment
        on review.main_identifier = appointment.main_identifier
where review.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }
}

Reviewer::$queryType = new ObjectType([
  'name' => 'Reviewer',
  'fields' => [
    'appointments' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Appointment::$queryType))),
      'resolve' => fn(User $user): array => array_merge(
        Reviewer::selectUnfinishedTransliterationReviewAppointments($user->username),
        Reviewer::selectUnfinishedXmlConversionAppointments($user->username)
      )
    ],
    'transliterationReviewAppointments' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Appointment::$queryType))),
      'resolve' => fn(User $user): array => Reviewer::selectUnfinishedTransliterationReviewAppointments($user->username)
    ],
    'transliterationReview' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => Reviewer::selectTransliterationReviewAppointment($args['mainIdentifier'], $user->username)
    ],
    'xmlConversionAppointments' => [
      'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::string()))),
      'resolve' => fn(User $user): array => []
    ],
    'xmlConversion' => [
      'type' => Type::string(),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string())
      ],
      'resolve' => fn(User $user, array $args): ?string => Reviewer::selectXmlConversionAppointment($args['mainIdentifier'], $user->username)
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
      // FIXME: check conditions!
      'resolve' => fn(User $user, array $args): bool => Reviewer::insertTransliterationReview($args['mainIdentifier'], $user->username, $args['review'])
    ],
    'submitXmlConversion' => [
      'type' => Type::nonNull(Type::boolean()),
      'args' => [
        'mainIdentifier' => Type::nonNull(Type::string()),
        'conversion' => Type::nonNull(Type::string())
      ],
      'resolve' => function (User $user, array $args): bool {
        $mainIdentifier = $args['mainIdentifier'];
        $conversion = $args['conversion'];

        // Reviewer::insertXmlConversion()
        return false;
      }
    ]
  ]
]);