<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';
require_once __DIR__ . '/Appointment.php';

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

  static function selectUserIsAppointedForXmlConversion(string $mainIdentifier, string $username): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_xml_conversion_appointments where main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function selectXmlConversionPerformed(string $mainIdentifier): bool
  {
    return SqlHelpers::executeSingleSelectQuery(
      "select count(*) as count from tlh_dig_xml_conversions where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  static function insertXmlConversion(string $mainIdentifier, string $converterUsername, string $xml): bool
  {
    return SqlHelpers::executeQueriesInTransactions(function (mysqli $conn) use ($mainIdentifier, $converterUsername, $xml): bool {
      $conversionInserted = SqlHelpers::executeSingleChangeQuery(
        "insert into tlh_dig_xml_conversions (main_identifier, input, converter_username) values (?, ?, ?);",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $mainIdentifier, $xml, $converterUsername),
        $conn,
      );

      return $conversionInserted && SqlHelpers::executeSingleChangeQuery(
          "update tlh_dig_manuscripts set status = 'XmlConversionPerformed' where main_identifier = ?;",
          fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
          $conn,
        );
    });
  }

  static function selectTransliterationInputForXmlConversionAppointment(string $mainIdentifier, string $username): ?string
  {
    // TODO: check if blocked...
    return SqlHelpers::executeSingleSelectQuery(
      "
select review.input
from tlh_dig_transliteration_reviews as review
    join tlh_dig_xml_conversion_appointments as appointment using(main_identifier)
where review.main_identifier = ? and username = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('ss', $mainIdentifier, $username),
      fn(array $row): string => $row['input']
    );
  }
}