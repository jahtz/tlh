<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/ReviewData.php';

use Exception;
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

  /** @deprecated move to manuscript! */
  static function insertTransliterationReview(string $mainIdentifier, string $reviewerUsername, string $input): bool
  {
    try {
      return SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($mainIdentifier, $reviewerUsername, $input): bool {
          $reviewDate = SqlHelpers::executeSingleReturnRowQuery(
            "insert into tlh_dig_transliteration_reviews (main_identifier, reviewer_username, input) values (?, ?, ?) returning review_date;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $reviewerUsername, $input),
            fn(array $row): string => $row['review_date'],
            $conn
          );

          if (is_null($reviewDate)) {
            throw new Exception("Could not insert transliteration review");
          }

          error_log($reviewDate);

          return SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'TransliterationReviewPerformed' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
            $conn
          );
        }
      );
    } catch (Exception $exception) {
      error_log($exception);
      return false;
    }
  }
}
