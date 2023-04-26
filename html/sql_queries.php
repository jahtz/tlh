<?php

require_once __DIR__ . '/model/Manuscript.php';
require_once __DIR__ . '/model/User.php';

use function sql_helpers\{executeMultiSelectQuery};


/**
 * @param string $username
 * @return string[]
 */
function selectManuscriptsToReview(string $username): array
{
  return executeMultiSelectQuery(
    "
select m.main_identifier
from tlh_dig_manuscript_metadatas as m
         left outer join tlh_dig_initial_transliterations as it on it.main_identifier = m.main_identifier
         left outer join tlh_dig_first_reviews as fr on fr.main_identifier = it.main_identifier
         left outer join tlh_dig_second_reviews as sr on sr.main_identifier = fr.main_identifier
         left outer join tlh_dig_approved_transliterations as at on sr.main_identifier = at.main_identifier
where m.creator_username <> ? -- user did not create manuscript
    and it.input is not null -- has something to review
    and fr.reviewer_username is null -- no first review yet (-> no second review!)
    or (
        fr.reviewer_username <> ? -- first review not from user
        and (
            sr.reviewer_username is null -- no second review yet
            or sr.reviewer_username <> ? -- second review also not from user
        )
    );",
    fn(mysqli_stmt $stmt) => $stmt->bind_param('sss', $username, $username, $username),
    fn(array $row): string => (string)$row['main_identifier']
  );
}
