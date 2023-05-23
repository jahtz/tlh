<?php

namespace model;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../MySafeGraphQLException.php';
require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

use GraphQL\Type\Definition\{ObjectType, Type};
use MySafeGraphQLException;
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

  static function selectTransliterationReviewPerformed(string $mainIdentifier): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_transliteration_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] == 1
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

  static function selectUserIsAppointedForXmlConversion(string $mainIdentifier, string $username): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_xml_conversion_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectXmlConversionPerformed(string $mainIdentifier): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_xml_conversions where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function insertXmlConversion(string $mainIdentifier, string $converterUsername, string $xml): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_xml_conversions (main_identifier, input, converter_username) values (?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $converterUsername)
    );
  }

  static function selectTransliterationInputForXmlConversionAppointment(string $mainIdentifier, string $username): ?string
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
      'resolve' => fn(User $user, array $args): ?string => Reviewer::selectTransliterationInputForXmlConversionAppointment($args['mainIdentifier'], $user->username)
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

        if (!Reviewer::selectTransliterationReviewPerformed($mainIdentifier)) {
          throw new MySafeGraphQLException("Transliteration review of manuscript $mainIdentifier is not yet performed!");
        }

        if (!Reviewer::selectUserIsAppointedForXmlConversion($mainIdentifier, $user->username)) {
          throw new MySafeGraphQLException("User $user->username is not appointed for xml conversion of manuscript $mainIdentifier!");
        }

        if (Reviewer::selectXmlConversionPerformed($mainIdentifier)) {
          throw new MySafeGraphQLException("Xml conversion for manuscript $mainIdentifier is already performed!");
        }

        // TODO: check if $conversion is xml and fulfills schema?

        return Reviewer::insertXmlConversion($mainIdentifier, $user->username, $conversion);
      }
    ]
  ]
]);