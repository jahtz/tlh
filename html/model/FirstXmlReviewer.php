<?php

namespace model;

use Exception;
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

abstract class FirstXmlReviewer
{

  /** @return Appointment[] */
  static function selectUnfinishedFirstXmlReviewAppointments(string $username): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "
select appointment.main_identifier, conversion.input is null as blocked
from tlh_dig_first_xml_review_appointments as appointment
    left outer join tlh_dig_first_xml_reviews as review using(main_identifier)
    left outer join tlh_dig_xml_conversions as conversion using(main_identifier)
where username = ? and review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::firstXmlReview, $row['blocked'] ? AppointmentType::xmlConversion : null)
    );
  }

  /** @deprecated move to manuscript! */
  static function insertFirstXmlReview(string $mainIdentifier, string $reviewerUsername, string $xml): bool
  {
    try {
      return SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($mainIdentifier, $reviewerUsername, $xml): bool {
          $reviewDate = SqlHelpers::executeSingleReturnRowQuery(
            "insert into tlh_dig_first_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?) returning review_date;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $reviewerUsername),
            fn(array $row): string => $row['review_date'],
            $conn
          );

          if (is_null($reviewDate)) {
            throw new Exception("Could not insert first xml review!");
          }

          error_log($reviewDate);

          return SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'FirstXmlReviewPerformed' where main_identifier = ?;",
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
