<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasXmlConversion
{
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
}
