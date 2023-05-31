<?php

namespace model;

use mysqli_stmt;
use function sql_helpers\executeMultiSelectQuery;
use function sql_helpers\executeSingleChangeQuery;
use function sql_helpers\executeSingleSelectQuery;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

abstract class SecondXmlReviewer
{

  /** @return Appointment[] */
  static function selectUnfinishedSecondXmlReviewAppointments(string $username): array
  {
    return executeMultiSelectQuery(
      "
select appointment.main_identifier, first_review.input is null as blocked
from tlh_dig_second_xml_review_appointments as appointment
    left outer join tlh_dig_second_xml_reviews as second_review
        on second_review.main_identifier = appointment.main_identifier
    left outer join tlh_dig_first_xml_reviews as first_review
        on first_review.main_identifier = appointment.main_identifier
where username = ? and second_review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::secondXmlReview, $row['blocked'] ? AppointmentType::firstXmlReview : null)
    );
  }

  static function selectSecondXmlReviewPerformed(string $mainIdentifier): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_second_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectUserIsAppointedForSecondXmlReview(string $mainIdentifier, string $username): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_second_xml_review_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectXmlForSecondReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    return executeSingleSelectQuery(
      "
select first_xml_rev.input
from tlh_dig_first_xml_reviews as first_xml_rev
    join tlh_dig_second_xml_review_appointments as second_xml_rev_app
        on second_xml_rev_app.main_identifier = first_xml_rev.main_identifier
where first_xml_rev.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }

  static function insertSecondXmlReview(string $mainIdentifier, string $reviewerUsername, string $xml): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_second_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $reviewerUsername)
    );
  }

}