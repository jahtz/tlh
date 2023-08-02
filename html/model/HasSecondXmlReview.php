<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasSecondXmlReview
{
  static function selectUserAppointedForSecondXmlReview(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select username from tlh_dig_second_xml_review_appointments where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['username']
    );
  }

  function selectSecondXmlReviewPerformed(): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_second_xml_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): bool => $row['count'] === 1
    );
  }

  function selectSecondXmlReviewData(): ?ReviewData
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select first_xml_rev.input, appointment.username
from tlh_dig_first_xml_reviews as first_xml_rev
    join tlh_dig_second_xml_review_appointments as appointment using(main_identifier)
where first_xml_rev.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $mainIdentifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }
}