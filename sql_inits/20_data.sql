use hpm;

set @mainid = 'KBo 08/15',
  @pwhash = '$2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy';

insert into tlh_dig_users (username, pw_hash, name, email, rights)
values ('admin1', @pwhash, 'Admin1', 'admin1@example.com', 'ExecutiveEditor'),
       ('admin2', @pwhash, 'Admin2', 'admin2@example.com', 'ExecutiveEditor');

insert into tlh_dig_manuscripts (main_identifier, creator_username, status)
values (@mainid, 'admin1', 'TransliterationReleased');

insert into tlh_dig_provisional_transliterations (main_identifier, input)
values (@mainid, '1'' # this °m.D°IS-A test?');

insert into tlh_dig_released_transliterations (main_identifier)
values (@mainid);