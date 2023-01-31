<?php

use GraphQL\Error\ClientAware;

class MySafeGraphQLException extends Exception implements ClientAware
{
  public function isClientSafe(): bool
  {
    return true;
  }
}