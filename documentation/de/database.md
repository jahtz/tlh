# Datenbank TLH (MySQL / MariaDB)

TLH benutzt für die persistente Speicherung der Daten eine MariaDB-Datenbank.
Es kann auch eine MySQL-Instanz benutzt werden, da beide bei den benutzten Features kompatibel ist.
Eine Anpassung auf andere SQL-Server-Distributionen sollte auch einfach möglich sein.

## Arten von Nutzern

In diesem Dokument ist von zwei verschiedenen Arten von Nutzern die Rede:

* MariaDB-Nutzer meint den Nutzernamen und das Password, mit dem sich der Server bei der Datenbank authentifiziert, um Daten abzufragen.
* TLH-Nutzer meint die Nutzer, die das Tool benutzen und Manuskripte erstellen und überprüfen. Die Zugangsdaten dieser Nutzer werden in der Datenbank
  gespeichert.

## Einrichtung der Datenbank

Bevor der Server gestartet wird, sollte die Datenbank eingerichtet werden, da ansonsten Fehler entstehen, da der Server nicht auf die Datenbank zugreifen kann.

## SQL-Skripte

Die folgenden Skripte zur Erstellung der Datenbank in einer **Entwicklungsumgebung** befinden sich im Ordner [`sql_inits`](/sql_inits).
Die Zahlen am Dateianfang sorgen dafür, dass die Dateien (aufgrund alphabetischer Sortierung) in der korrekten Reihenfolge ausgeführt werden.

* `00_users_init.sql`: Durch diese Datei wird ein MariaDB-Standardnutzer erstellt, der Zugriffe und alle Rechte auf der Datenbank `hpm` besitzt
* `10_tlh_dig.sql`: In dieser Datei befinden sich die eigentlichen Tabellendefinitionen. **Achtung**: Der Einfachheit halber **löscht** diese Datei alle alten
  Tabellen bevor diese neu angelegt werden!
* `20_data.sql`: Diese Datei erstellt Nutzer für TLH und erzeugt Beispieldateien.

Die Zugangsdaten zur Datenbank werden in der Datei [`html/mysqliconn.php`](../../html/mysqliconn.php) hinterlegt.
Standardmäßig sind hier Dummydaten eingetragen, die so auch in der Entwicklung benutzt werden können.
Diese Skripte sollten nur auf einem Entwicklungsrechner direkt verwendet werden!

### Entwicklungsrechner

Auf einem **Entwicklungsrechner** kann eine passende MariaDB-Instanz mit [Docker Compose](https://docs.docker.com/get-started/08_using_compose/) angelegt
werden.
Eine entsprechende `docker-compose.yaml` Datei wird mitgeliefert.
Beim Start werden automatisch alle SQL-Skripte (siehe unten) eingebunden und ausgeführt.
Dazu wird folgender Befehl (OS-unabhängig) ausgeführt:

```bash
# "alte" Syntax: docker-compose separat installiert
docker-compose up -d

# "neue" Syntax: compose als Sub-Befehl von docker verfügbar
docker compose up -d
```

### Produktivumgebung

Auf einem Produktivserver kann eine MariaDB-Instanz vorinstalliert sein.
**Auf jeden Fall** sollten hier strengere Richtlinien für das MariaDB-Nutzer-Passwort befolgt werden.
Die Konfigurationsparameter der Instanz müssen in der Datei `mysqliconn.php` angepasst werden!
Genauere Informationen befinden sich in der [Deployment-Anleitung](./deployment.md).

**Wichtig**: Die vorhandenen SQL-Skripte sind unter anderem aus folgenden Gründen nicht *direkt* zur Ausführung in einer Produktivumgebung geeignet:

* Der Datenbank-Nutzer (Nutzername `hpm` und Passwort `1234`) werden normalerweise vom Hoster vorgegeben und müssen daher nicht selbst erstellt werden.
* Das Skript zur Erstellung der Tabellen enthält `drop table`-Anweisungen, die **alle Daten in den Tabellen löschen** und daher nur bei der Initialisierung
  ausgeführt werden dürfen.

## Übersicht Tabellen

Alle Tabellen sind mit dem Präfix `tlh_dig` gekennzeichnet, um sie auch bei einem Deployment mit anderen Tabellen schnell zu finden.

* `tlh_users` speichert alle TLH-Nutzer (siehe oben, "Arten von Nutzern")
* `tlh_dig_manuscripts` speichert die Basisdaten von Manuskripten wie z. B. den Haupt-Identifikator, Typ des Haupt-Identifikators oder die Paläografische
  Klassifikation.
  Im Fremdschlüssel `creator_username` wird eine Referenz auf den Nutzer gespeichert, der das Manuskript erstellt hat.
  Durch den Standardwert `now()` für `creation_date` wird diese Spalte immer auf das korrekte Datum gesetzt und muss bei einem `insert` nicht extra angegeben
  werden.
* `tlh_dig_manuscript_oder_identifiers` speichert alle weiteren Identifikatoren, die für ein Manuskript angegeben werden und bezieht sich durch den
  Fremdschlüssel `main_identifier` auf die Basisdaten eines Manuskripts in `tlh_dig_manuscripts`
* `tlh_dig_provisional_transliterations` speichert die Transliteration, die vom Autor eines Manuskripts eingegeben wird.
  Die Speicherung erfolgt im Rohformat (also **nicht** in geparster Form) und sollte nur solange überschrieben werden, bis die Transliteration freigegeben
  worden ist.
* `tlh_dig_released_transliterations` speichert den Zeitpunkt, an dem eine provisorische Transliteration freigegeben wurde.
  **Wichtig**: Die eigentliche Transliteration wird nicht gespeichert, sondern es wird der Wert in der Tabelle `tlh_dig_provisional_transliterations`
  angenommen.
  Die provisorische Transliteration darf also ab der Freigabe nicht mehr geändert werden!

Die folgenden acht Tabellen werden für Pipeline-Schritte Transliterations-Review (`transliteration_review`), Xml-Konvertierung (`xml_conversion`), erstes
Xml-Review (`first_xml_conversion`) und zweites Xml-Review (`second_xml_review`) benötigt, die jeweils von TLH-Nutzern mit den Rechten `Reviewer`
oder `ExecutiveEditor` durchgeführt werden sollen:

* `tlh_dig_transliteration_review_appointment`
* `tlh_dig_transliteration_reviews`
* `tlh_dig_xml_conversion_appointment`
* `tlh_dig_xml_conversions`
* `tlh_dig_first_xml_review_appointment`
* `tlh_dig_first_xml_reviews`
* `tlh_dig_second_xml_review_appointment`
* `tlh_dig_second_xml_reviews`

Für jeden Schritt gibt es zwei Tabellen:

* `tlh_dig_<step>_appointments` speichert, welche Reviewer für diesen Schritt eingeteilt wurde. Durch die Definition des Fremdschlüssels auf die
  Tabelle `tlh_dig_released_transliterations` kann die Einteilung bereits erfolgen, bevor der vorhergehende Schritt erfolgt ist.
* `tlh_dig_<step>s` speichert das eigentliche Ergebnis des Schritts. Hierbei wird der Fremdschlüssel auf die jeweilige `appointment`-Tabelle gesetzt, damit
  sichergestellt ist, dass der Schritt nur vom zuständigen Nutzer durchgeführt werden kann. In der Spalte `input` wird jeweils das Ergebnis des Schrittes
  als Transliterationseingabe (Schritt 1) oder XML (Schritte 2, 3 und 4) gespeichert.

Die Tabelle `tlh_dig_approved_transliterations` speichert die freigegebenen Dokumente. In der Spalte `input` wird das Ergebnis der letzten Überprüfung durch
einen TLH-Nutzer mit den Rechten `ExecutiveEditor` im XML-Format gespeichert. Durch den Fremdschlüssel auf die Tabelle `xml_second_xml_reviews` wird
sichergestellt, dass dies erst nach dem zweiten XML-Review erfolgen kann.