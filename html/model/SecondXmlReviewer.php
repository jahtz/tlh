<?php

namespace model;

use MySafeGraphQLException;
use mysqli_stmt;
use function sql_helpers\executeMultiSelectQuery;

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
    // FIXME: implement!
    return false;
  }

  static function selectXmlForSecondReviewAppointment(string $mainIdentifier, string $username): ?string
  {
    throw new MySafeGraphQLException('TODO: implement!');
  }

}