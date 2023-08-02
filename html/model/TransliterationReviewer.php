<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/ReviewData.php';

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
}
