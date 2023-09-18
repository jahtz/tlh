<?php

const mailAddresses = [
  "tlhdig@uni-wuerzburg.de",
  "charles.steitler@adwmainz.de"
];

function sendMailToAdmins(string $header, string $body): bool
{
  return mail(implode(',', mailAddresses), "[TLHdig]" . $header, $body, "From: TLH dig <tlhdig@uni-wuerzburg.de>\r\n");
}

function sendSingleMail(string $to, string $header, string $body): bool
{
  return mail($to, "[TLHdig]" . $header, $body, "From: TLH dig <tlhdig@uni-wuerzburg.de>\r\n");
}