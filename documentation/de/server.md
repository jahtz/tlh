# TLH dig Server (PHP)

Der Code für TLH dig, der auf dem Server ausgeführt wird, ist in PHP geschrieben und befindet sich im Ordner `html`.
Es wird eigentlich nur eine Zwischenschicht bereitgestellt, um den Zugriff auf die Datenbank (siehe [Datenbank-Dokumentation](./database.md)) zu regeln und
für das Frontend (siehe [Client-Dokumentation](./client.md)) im [GraphQL](https://graphql.org/)-Format bereitzustellen.

## Aufrufbare Dateien

Nur wenige PHP-Dateien im Ordner `html` sind dafür gemacht, direkt aufgerufen zu werden:

* `graphql.php` stellt den GraphQL-Endpunkt dar, der vom Frontend zum Abruf von Daten genutzt wird
* `graphiql.php` bietet eine interaktive Möglichkeit, die GraphQL-Schnittstelle zu benutzen. Diese Datei kann in Produktivumgebungen weggelassen werden.
* `uploadPictures.php` wird dazu benutzt, (Bild-)Dateien entgegenzunehmen, die von Autoren für die Manuskripte hochgeladen werden, da GraphQL keine
  Schnittstelle für den Dateiupload benutzt.
* `index.php` bietet einen Standard-Einstieg in das Tool. Auf einem Entwicklungsrechner wird auf die Datei `graphiql.php` weitergeleitet, in einer
  Produktivumgebung auf die Dateien für das Frontend (siehe [Deployment-Anleitung](./deployment.md)).

*Alle* anderen PHP-Dateien, insbesondere im Ordner `model`, werden **nur** in anderen Dateien eingebunden.

## Ordner

Der Ordner `html/public` ist anfangs nicht vorhanden und wird erst beim Deployment erzeugt. Hier werden die Dateien für das Frontend vom Skript `/build.sh` hier
abgelegt und werden von der Datei `ìndex.php` auch hier erwartet.

Im Ordner `html/uploads` werden die Bilder gespeichert, die die Autoren hochladen. Dabei wird für jedes Manuskript ein eigener Ordner mit dem Names des
Haupt-Identifikators erstellt.

## Abhängigkeiten (Dependencies)

Dieses Projekt benutzt [Composer](https://getcomposer.org/), um die Abhängigkeiten (auf anderen Code, z. B. einer Bibliothek für GraphQL) zu verwalten.
Die Definition der Abhängigkeiten erfolgt in der Datei `/composer.json`.

### Erstmalige Installation (Entwicklungsrechner)

Um die Abhängigkeiten erstmalig zu installieren, muss folgender Befehl im Root-Ordner des Projekts aufgeführt werden:

```bash
composer install
```

Dabei wird der Ordner `html/vendor` erzeugt und der Code aller Abhängigkeiten dort platziert. Durch das Einbinden der Datei `vendor/autoload.php` können nun
alle Abhängigkeiten benutzt werden.

### Überprüfung auf Updates

Außerdem sollte regelmäßig eine Überprüfung auf Update von benutzten Bibliotheken durchgeführt werden. Dazu kann der Befehl `composer outdated` benutzt werden.
Bei kleineren Updates (gemäß [Semantic Versioning](https://semver.org/lang/de/)) kann Composer das Upgrade mit dem Befehl `composer update` selbst durchführen,
andernfalls muss die Datei `composer.json` angepasst werden und dann `composer update` ausgeführt werden.

```bash
# Überprüfung auf Aktualisierungen
composer outdated

# Upgrade
composer update
```

## PHP-Version

Momentan wird das Projekt für die PHP-Version 7.4 entwickelt. Diese wird auch als Version in der Datei `/composer.json` angegeben und von IDEs, wie z. B.
PHPStorm, als Referenz für Hinweise und Fehlermeldungen benutzt. Diese Version sollte in Abstimmung mit verfügbaren PHP-Versionen, insbesondere derjenigen, die
in der Produktivumgebung benutzt wird, angepasst werden, damit Inkompatibilitäten zwischen den Versionen frühzeitig entdeckt werden können.
