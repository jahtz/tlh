use hpm;

SET @mainId = 'KBo 08/15',
  @pwHash = '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy';

insert into tlh_dig_users (username, pw_hash, name, email, rights)
values ('jack', @pwHash, 'Jack Bourne', 'jack.bourne@example.com', 'ExecutiveEditor'),
       ('admin1', @pwHash, 'Admin1', 'admin1@example.com', 'ExecutiveEditor'),
       ('admin2', @pwHash, 'Admin2', 'admin2@example.com', 'ExecutiveEditor');

insert into tlh_dig_manuscripts (main_identifier, creator_username)
values (@mainId, 'jack');

insert into tlh_dig_provisional_transliterations (main_identifier, input)
values (@mainId, '1'' # this °m.D°IS-A test?');

insert into tlh_dig_released_transliterations (main_identifier)
values (@mainId);