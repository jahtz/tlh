<?php

namespace model;

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

  static function selectFirstXmlReviewPerformed(string $mainIdentifier): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_first_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectUserIsAppointedForFirstXmlReview(string $mainIdentifier, string $username): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_first_xml_review_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function insertFirstXmlReview(string $mainIdentifier, string $reviewerUsername, string $xml): bool
  {
    return SqlHelpers::executeQueriesInTransactions(function (mysqli $conn) use ($mainIdentifier, $reviewerUsername, $xml): bool {
      $reviewInserted = SqlHelpers::executeSingleChangeQuery(

        "insert into tlh_dig_first_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?);",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $reviewerUsername),
        $conn
      );

      return $reviewInserted && SqlHelpers::executeSingleChangeQuery(
          "update tlh_dig_manuscripts set status = 'FirstXmlReviewPerformed' where main_identifier = ?;",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
          $conn
        );
    });
  }

  static function selectXmlForFirstXmlReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    return SqlHelpers::executeSingleSelectQuery(
      "
select xml_conversion.input
from tlh_dig_xml_conversions as xml_conversion
    join tlh_dig_first_xml_review_appointments as first_xml_rev_app using(main_identifier)
where xml_conversion.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }

}