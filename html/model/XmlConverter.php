<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';
require_once __DIR__ . '/ReviewData.php';

use Exception;
use mysqli;
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

  /** @deprecated move to Manuscript! */
  static function insertXmlConversion(string $mainIdentifier, string $converterUsername, string $xml): bool
  {
    try {
      return SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($mainIdentifier, $converterUsername, $xml): bool {
          $conversionDate = SqlHelpers::executeSingleReturnRowQuery(
            "insert into tlh_dig_xml_conversions (main_identifier, input, converter_username) values (?, ?, ?) returning conversion_date;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $converterUsername),
            fn(array $row): string => $row['conversion_date'],
            $conn,
          );

          if (is_null($conversionDate)) {
            return false;
          }

          error_log($conversionDate);

          return SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'XmlConversionPerformed' where main_identifier = ?;",
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
