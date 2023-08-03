<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use Exception;
use MySafeGraphQLException;
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasXmlConversion
{
  /** @throws MySafeGraphQLException */
  function upsertXmlConversionAppointment(string $converter, string $appointedBy): string
  {
    try {
      return SqlHelpers::executeSingleChangeQuery(
        "
insert into tlh_dig_xml_conversion_appointments (main_identifier, username, appointed_by_username)
values (?, ?, ?)
on duplicate key update username = ?, appointed_by_username = ?, appointment_date = now();",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $this->mainIdentifier->identifier, $converter, $appointedBy, $converter, $appointedBy)
      );
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save appointment!");
    }
  }

  function selectUserAppointedForXmlConversion(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select username from tlh_dig_xml_conversion_appointments where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['username']
    );
  }

  function selectXmlConversionPerformed(): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_xml_conversions where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  function selectXmlConversionData(): ?ReviewData
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select review.input, appointment.username
from tlh_dig_transliteration_reviews as review
    join tlh_dig_xml_conversion_appointments as appointment using(main_identifier)
where review.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }

  /** @throws MySafeGraphQLException */
  function insertXmlConversion(string $converterUsername, string $xml): string
  {
    try {
      SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($converterUsername, $xml): void {
          SqlHelpers::executeSingleChangeQuery(
            "insert into tlh_dig_xml_conversions (main_identifier, input, converter_username) values (?, ?, ?);",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $xml, $converterUsername),
            $conn,
          );

          SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'XmlConversionPerformed' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
            $conn
          );
        }
      );

      $conversionDate = SqlHelpers::executeSingleReturnRowQuery(
        "select conversion_date from tlh_dig_xml_conversions where main_identifier = ?;",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
        fn(array $row): string => $row['conversion_date']
      );

      if (is_null($conversionDate)) {
        throw new Exception("Could not select previously inserted xml conversion!");
      }

      return $conversionDate;
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save xml conversion for manuscript " . $this->mainIdentifier->identifier . "!");
    }
  }
}
