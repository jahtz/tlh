# TLH dig

TODO!

An overview of the source code is available in [German](./documentation/de/Main.md).

## First start

### PHP Extensions

These php extensions have to be activated:

* `mysql`

### Install dependencies

```bash
# server dependencies
php7 /usr/bin/composer install

# ui dependencies
cd ui
npm i
```

### Starting the server & ui

```bash
# server
cd html
php -S 0.0.0.0:8066

# ui
cd ui
npm run start
```