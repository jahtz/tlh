<?php

namespace model;

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
}
