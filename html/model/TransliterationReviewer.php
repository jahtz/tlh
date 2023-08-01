<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/ReviewData.php';

use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

abstract class TransliterationReviewer
{

  /** @return Appointment[] */
  static function selectUnfinishedTransliterationReviewAppointments(string $username): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "
select appointment.main_identifier
    from tlh_dig_transliteration_review_appointments as appointment
    left outer join tlh_dig_transliteration_reviews as review on review.main_identifier = appointment.main_identifier
    where username = ? and review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::transliterationReview, null)
    );
  }

  static function selectTransliterationReviewData(string $mainIdentifier): ?ReviewData
  {
    return SqlHelpers::executeSingleSelectQuery(
      "
select transliteration.input, appointment.username
from tlh_dig_transliteration_review_appointments as appointment
    join tlh_dig_released_transliterations as released using(main_identifier)
    join tlh_dig_provisional_transliterations as transliteration using(main_identifier)
where appointment.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }

  static function selectTransliterationReviewPerformed(string $mainIdentifier): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_transliteration_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] == 1
    );
  }

  static function insertTransliterationReview(string $mainIdentifier, string $reviewerUsername, string $input): bool
  {
    return SqlHelpers::executeQueriesInTransactions(function (mysqli $conn) use ($mainIdentifier, $reviewerUsername, $input): bool {
      $reviewInserted = SqlHelpers::executeSingleChangeQuery(
        "insert into tlh_dig_transliteration_reviews (main_identifier, reviewer_username, input) values (?, ?, ?);",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $reviewerUsername, $input),
        $conn
      );

      return $reviewInserted && SqlHelpers::executeSingleChangeQuery(
          "update tlh_dig_manuscripts set status = 'TransliterationReviewPerformed' where main_identifier = ?;",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
          $conn
        );
    });
  }

  static function selectUserIsAppointedForTransliterationReview(string $mainIdentifier, string $username): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_transliteration_review_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }
}