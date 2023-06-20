<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

use mysqli;
use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeQueriesInTransactions, executeSingleChangeQueryWithConnection, executeSingleSelectQuery};

abstract class TransliterationReviewer
{

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
    join tlh_dig_released_transliterations as released using(main_identifier)
    join tlh_dig_provisional_transliterations as transliteration using(main_identifier)
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
    return executeQueriesInTransactions(function (mysqli $conn) use ($mainIdentifier, $reviewerUsername, $input): bool {
      $reviewInserted = executeSingleChangeQueryWithConnection(
        $conn,
        "insert into tlh_dig_transliteration_reviews (main_identifier, reviewer_username, input) values (?, ?, ?);",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $reviewerUsername, $input),
      );

      return $reviewInserted && executeSingleChangeQueryWithConnection(
          $conn,
          "update tlh_dig_manuscripts set status = 'TransliterationReviewPerformed' where main_identifier = ?;",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier)
        );
    });
  }
}