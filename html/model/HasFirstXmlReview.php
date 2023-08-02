<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasFirstXmlReview
{
  function selectUserAppointedForFirstXmlReview(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select username from tlh_dig_first_xml_review_appointments where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['username']
    );
  }

  function selectFirstXmlReviewPerformed(): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_first_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  function selectFirstXmlReviewData(): ?ReviewData
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select xml_conversion.input, appointment.username
from tlh_dig_xml_conversions as xml_conversion
    join tlh_dig_first_xml_review_appointments as appointment using(main_identifier)
where xml_conversion.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }
}
