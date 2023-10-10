# Deployment

TLH dig wird üblicherweise in der bestehenden Infrastruktur des Rechenzentrums der Uni Würzburg gehostet.
Für das Deployment auf diese Server werden daher die Zugangsdaten benötigt.

## Build als Production Release

*Voraussetzungen*:

- `npm` installiert
- `composer` installiert

**Wichtig:**
- Einmalig sollte `composer install` im Root-Ordner ausgeführt werden, um die PHP-Dependencies in den Ordner `html/vendor` zu installieren, da diese Dateien nicht versioniert werden, aber vom Server benötigt werden.

- Die Versionsnummer in der Datei `ui/package.json` **muss** auf einen (neueren) Wert angepasst werden, da diese in der [URL-Datei](/ui/src/urls.ts) aus einer (Standard-)Umgebungsvariable gelesen wird und für die korrekte Funktionalität in einer Produktionsumgebung mit der URL, unter der die Version gehostet wird, übereinstimmem muss!

Die Schritte, die für einen `Production Build` erforderlich sind, lassen sich aus dem Skript `buildProd.sh` entnehmen.
Dies kann - auf Linux - auch direkt ausgeführt werden.

Prinzipiell geht es darum, im Unterordner `ui` einen Build des React-Codes auszuführen und diese Dateien dann in den dafür vorgesehenen Ordner `html/public` zu kopieren.
Der Zielordner sollte vorher geleert werden, um die Größe des hochzuladenen Codes niedrig zu halten.

Das Build-Skript legt auch eine `.htaccess`-Datei im Ordner `html/public` an, die für ein korrektes Verhalten von React beim Neuladen der Seite sorgt.

## Hochladen auf Server

Wenn die Server-Dependencies (per `composer install`) installiert und der Build des UI ausgeführt wurde, sind prinzipiell alle Dateien, die auf den Server geladen werden müssen, **im** Ordner `html` verfügbar.
Die Dateien im Root-Ordner werden **nicht** auf den Server geladen.
Diese müssen dann per `(s)ftp` auf die Server des RZ in den Ordner `htdocs/tlh_editor/<version>` geladen werden.
Dazu kann `Filezilla` als GUI-Tool oder `rclone` als CLI-Tool benutzt werden.

Ein Deploy mit `rclone` kann z. B. folgendermaßen aussehen. Dabei **muss** die Variable `<version>` mit der aktuellen Version ausgetauscht werden.

```bash
rclone copy html/ hethport3:htdocs/tlh_editor/<version> --progress --transfers=8
```
Nach dem Deployment müssen noch zwei Dinge gemacht werden:

- In der Datei `htdocs/tlh_editor/<version>/mysqsliconn.php` müssen die die *echten* Zugangsdaten für die Datenbank eingetragen werden, da hier noch die Werte für eine Entwicklungsumgebung eingetragen sein.
Dazu kann z. B. eine andere `mysqliconn.php` aus einer älteren Version kopiert werden.

- In der Datei `htdocs/tlh_editor/index.php` verweist eine Variable auf die vorhergehende Version.
Diese Datei sollte auch angepasst werden, da hier ein automatischer Redirect stattfindet!