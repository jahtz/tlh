<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/ReviewData.php';

use mysqli_stmt;
use sql_helpers\SqlHelpers;

abstract class XmlConverter
{
  /** @return Appointment[] */
  static function selectUnfinishedXmlConversionAppointments(string $username): array
  {
    return SqlHelpers::executeMultiSelectQuery(
      "
select appointment.main_identifier, review.input is null as blocked
from tlh_dig_xml_conversion_appointments as appointment
  left outer join tlh_dig_xml_conversions as conversion using(main_identifier)
  left outer join tlh_dig_transliteration_reviews as review using(main_identifier)
where username = ? and conversion.input is null;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $username),
      fn(array $row): Appointment => new Appointment($row['main_identifier'], AppointmentType::xmlConversion, $row['blocked'] ? AppointmentType::transliterationReview : null)
    );
  }
}
