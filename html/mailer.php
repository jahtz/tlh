<?php

const mailAddresses = [
  "tlhdig@uni-wuerzburg.de",
  "charles.steitler@adwmainz.de"
];

function sendMails(string $header, string $body)
{
  foreach (mailAddresses as $mailAddress) {
    mail(
      $mailAddress,
      "[TLHdig]" . $header,
      $body
    );
  }
}