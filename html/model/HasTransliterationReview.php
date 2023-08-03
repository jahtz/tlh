<?php

namespace model;

require_once __DIR__ . '/../sql_helpers.php';

use Exception;
use MySafeGraphQLException;
use mysqli;
use mysqli_stmt;
use sql_helpers\SqlHelpers;

trait HasTransliterationReview
{
  /** @throws MySafeGraphQLException */
  function upsertReviewerAppointmentForReleasedTransliteration(string $reviewer, string $appointedBy): string
  {
    try {
      return SqlHelpers::executeSingleChangeQuery(
        "
insert into tlh_dig_transliteration_review_appointments (main_identifier, username, appointed_by_username)
values (?, ?, ?)
on duplicate key update username = ?, appointed_by_username = ?, appointment_date = now();",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sssss', $this->mainIdentifier->identifier, $reviewer, $appointedBy, $reviewer, $appointedBy)
      );
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save appointment!");
    }
  }

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

  /** @throws MySafeGraphQLException */
  function insertTransliterationReview(string $reviewerUsername, string $input): string
  {
    try {
      SqlHelpers::executeQueriesInTransactions(
        function (mysqli $conn) use ($reviewerUsername, $input): void {
          SqlHelpers::executeSingleChangeQuery(
            "insert into tlh_dig_transliteration_reviews (main_identifier, reviewer_username, input) values (?, ?, ?);",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('sss', $this->mainIdentifier->identifier, $reviewerUsername, $input),
            $conn
          );

          SqlHelpers::executeSingleChangeQuery(
            "update tlh_dig_manuscripts set status = 'TransliterationReviewPerformed' where main_identifier = ?;",
            fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
            $conn
          );
        }
      );

      $reviewDate = SqlHelpers::executeSingleReturnRowQuery(
        "select review_date from tlh_dig_transliteration_reviews where main_identifier = ?;",
        fn(mysqli_stmt $stmt): bool => $stmt->bind_param('s', $this->mainIdentifier->identifier),
        fn(array $row): string => $row['review_date']
      );

      if (is_null($reviewDate)) {
        throw new Exception("Could not select previously inserted transliteration review!");
      }

      return $reviewDate;
    } catch (Exception $exception) {
      error_log($exception);
      throw new MySafeGraphQLException("Could not save transliteration review for manuscript " . $this->mainIdentifier->identifier . "!");
    }
  }
}
