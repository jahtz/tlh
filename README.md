# TLH dig

TODO!

## First start

### PHP Extensions

These php extensions have to be activated:

* mysql

### Installing server dependencies

```bash
php7 /usr/bin/composer install
```

### Installing ui dependencies

```bash
cd ui

npm i
```

### Starting the server

```bash
php7 -S 0.0.0.0:8066 -t html router.php
```

### Starting the ui

```bash
npm run start
```