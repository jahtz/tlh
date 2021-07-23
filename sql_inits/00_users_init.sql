create user hpm@'%' identified by '1234';

grant all on hpm.* to hpm@'%';

flush privileges;
