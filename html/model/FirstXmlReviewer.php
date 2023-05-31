<?php

namespace model;

use mysqli_stmt;
use function sql_helpers\{executeMultiSelectQuery, executeSingleChangeQuery, executeSingleSelectQuery};

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

abstract class FirstXmlReviewer
{

  /** @return Appointment[] */
  static function selectUnfinishedFirstXmlReviewAppointments(string $username): array
  {
    return executeMultiSelectQuery(
      "
select appointment.main_identifier, conversion.input is null as blocked
from tlh_dig_first_xml_review_appointments as appointment
    left outer join tlh_dig_first_xml_reviews as review
        on review.main_identifier = appointment.main_identifier
    left outer join tlh_dig_xml_conversions as conversion
        on conversion.main_identifier = appointment.main_identifier
where username = ? and review.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::firstXmlReview, $row['blocked'] ? AppointmentType::xmlConversion : null)
    );
  }

  static function selectFirstXmlReviewPerformed(string $mainIdentifier): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_first_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectUserIsAppointedForFirstXmlReview(string $mainIdentifier, string $username): bool
  {
    return executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_first_xml_review_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function insertFirstXmlReview(string $mainIdentifier, string $reviewerUsername, string $xml): bool
  {
    return executeSingleChangeQuery(
      "insert into tlh_dig_first_xml_reviews (main_identifier, input, reviewer_username) values (?, ?, ?);",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $reviewerUsername)
    );
  }

  static function selectXmlForFirstXmlReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    return executeSingleSelectQuery(
      "
select xml_conversion.input
from tlh_dig_xml_conversions as xml_conversion
    join tlh_dig_first_xml_review_appointments as first_xml_rev_app
        on first_xml_rev_app.main_identifier = xml_conversion.main_identifier
where xml_conversion.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }

}