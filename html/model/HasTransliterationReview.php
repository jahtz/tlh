<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasTransliterationReview
{
  function selectUserAppointedForTransliterationReview(): ?string
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select username from tlh_dig_transliteration_review_appointments where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): string => $row['username']
    );
  }

  function selectTransliterationReviewPerformed(): bool
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "select count(*) as count from tlh_dig_transliteration_reviews where main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): bool => $row['count'] == 1
    );
  }

  function selectTransliterationReviewData(): ?ReviewData
  {
    return SqlHelpers::executeSingleReturnRowQuery(
      "
select transliteration.input, appointment.username
from tlh_dig_transliteration_review_appointments as appointment
    join tlh_dig_provisional_transliterations as transliteration using(main_identifier)
where appointment.main_identifier = ?;",
      fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
      fn(array $row): ReviewData => new ReviewData($row['input'], $row['username'])
    );
  }
}
