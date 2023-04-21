delete
from tlh_dig_users
where username like 'user%';

SET
  @pw_hash = '2y$10$vjF0vsyhdJ7alN3Q.JwmLuvyF1HzAwStyolDD117vE.tM3KxIBjwy',
  @count = 20;

DELIMITER //

FOR var IN 0..@count
DO
SET @num = lpad(var, 2, '0');
SET
  @username = concat('user ', @num),
  @name = concat('User ', @num),
  @mail = concat('user', @num, '@example.com');

INSERT INTO tlh_dig_users (username, pw_hash, name, email)
values (@username, @pw_hash, @name, @mail);

END FOR;
//

DELIMITER ;