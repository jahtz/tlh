<?php

namespace model;

class ReviewData
{
  public string $input;
  public string $username;

  public function __construct(string $input, string $username)
  {
    $this->input = $input;
    $this->username = $username;
  }
}