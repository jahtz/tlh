<?php

require_once __DIR__ . '/vendor/autoload.php';

use GraphQL\Error\ClientAware;

class MySafeGraphQLException extends Exception implements ClientAware
{
  public function isClientSafe(): bool
  {
    return true;
  }
}