# Grammatik für Simtex / TLH dig

## Erklärungen für Operatoren:

* `?`: optional
* `*`: 0 bis beliebig oft
* `+`: mindestens 1 bis beliebig oft
* `|`: oder
* `WS`: Whitespace (Leerzeichen, Tab, …)
* `OWS`: optionaler WS (entspricht `WS*`)
* Zeichen in Anführungszeichen sind Terminalsymbole
* Zeilen, die mit „//“ starten, sind Kommentare

## Grammatik:

```
Line = LineNum LineNumAbsolute? OWS "#" OWS Content
LineNum = [1-9][0-9]*
LineNumAbsolute = "'"

CONTENT = Word (WS Word)*

Word = Illegible | SingleContent+

Illegible = "x"

SingleContent = Sumerogramm | Akkadogramm  | Determinativ | MaterLectionis | TextContent

Sumerogramm = "--"? (UpperCaseLetter | TextContent)+ 
Akkadogramm = ("_" | "-") (UpperCaseLetter | TextContent)+
Determinativ = "°" (UpperText | SpecialDeterminativ) "°"
SpecialDeterminativ = "m" | "f" | ("m." UpperText) | ("f." UpperText)
MaterLectionis = "°" LowerText "°"

TextContent = Mark | Damage | Correction | LowerText

UpperText = UpperCaseLetter+
LowerText = LowerCaseLetter+

Mark = "{" ("S" | "K" | "F" | "G") ":" ... "}"

Damage = "[" | "]" | "⸢" | "⸣" | ...
Correction = "?" | "!" | "(?)" | "§" | "§§" | "¬¬¬" | "===" ...

UpperCaseLetter = "A" | "B" | ... | "Z" | ...
LowerCaseLetter = "a" | "b" | ... | "z" | ...

// TODO: how to incorporate?
SyllableSeparator = "-"
```