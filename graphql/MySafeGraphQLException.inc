<?php

namespace tlh_dig\graphql;

use Exception;
use GraphQL\Error\ClientAware;

class MySafeGraphQLException extends Exception implements ClientAware
{

  public function isClientSafe(): bool {
    return true;
  }

  public function getCategory() {
    return 'businessLogic';
  }
}