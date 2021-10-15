# Physik

Die Physics.World enthält alle Körper.
Ein Körper kann sich eigenständig bewegen, hat eine Masse und so genannte HitPhases.
Dies sind Rechteckige Begrenzungsflächen, die parrallel zu den Hauptebenen liegen.
In jedem Tick wird berechnet wann sich welche Flächen treffen, für diese Flächen ein unelastischer Stoß durchgeführt und die Körper miteinander verbunden.
Dieser Körperverband bewegt sich nach dem Stoß mit selber Geschwindigkeit fort. Dann wird nach dem nächsten Stoß geschaut. 
Am Ende des Ticks werden alle Körper an ihre Endposition bewegt, dann wird der Gravitationskraft Impuls übertragen. Dann wird der Teilelastische Stoß durchgeführt (Flächen stoßen sich wieder voneinander ab) und die Reibung berechnet.  

Es werden SI Einheiten verwendet (Meter, Kilogramm, Sekunde, Meter pro Sekunde, ...)

Es sind nur die Funktionen Aufgeführt, die für den Nutzer relevant sind.

## class Physics.World
### constructor(CollisionManager collisionManager,CoefficientsManager coefficientsManager)
Wenn collisionManager oder coefficientsManager undefined sind, wird der default CollisionManager/CoefficientsManager genutzt.

### Array([Body,Body,...]) bodys
Array bestehend aus Body
In diesem Array sind alle Körper abgelegt. Nach dem es verändert wurde, sollte calcPhasePairs() vor dem nächsten Tick aufgerufen werden.
### void <- calcPhasePairs()
Diese Funktion berechnet alle Paare an Flächen, die sich stoßen können. (Flächenpaare, die parallel und entgegengerichtet sind)
### void <- tick(Number dt)
Berechnet die Physik Simmulation. dt ist der Zeitschritt in Sekunden, in der die Simmulation berechnet wird. Dieser sollte möglichst klein sein (0.01 bis 0.1 Sekunden).

## class Physics.Body
### constructor(String id,[Number,Number,Number] position, [Number,Number,Number] velocity, Number mass, Boolean sink)
Erzeugt einen neuen Körper mit der id id, an der stele Position mit der Geschwindigkeit velocity, der Masse mass.
Wenn sink=true, können keine anderen Körper durch Stoße seine Geschwindigkeit ändern. Seine Masse sollte in diesem Fall um ein Vielfaches größer als alle anderen Körper sein, jedoch auch nicht zu Groß.
Stoßen zwei Körper mit sink=true aneinander (auch wenn ein anderer Körper zwischen ihnen ist), ensteht ein Fehler.

Nach dem Konstruktor haben die Körper noch keine Begrenzungsflächen.

### void <- setHitPhases([HitPhase,...] phases)
Setzt die Begrenzungsflächen.

### void <- applyPulse([Number,Number,Number] pulse)
Überträgt den Impuls pulse (3d Vektor).

## class Physics.HitPhase
### constructor(String id ,Body body,[Number,Number,Number] centerPos, Physics.HitPhase.AXIS normaleAxis,Physics.HitPhase.DIRECTION direction,[Number,Number] size)
- id: id der Begrenzungsfläche  
- body: Dazugehöriger Körper
- centerPos: Position der Mitte der Fläche 
- normaleAxis: Normalenachse (Physics.HitPhase.AXIS.X, Physics.HitPhase.AXIS.Y oder Physics.HitPhase.AXIS.Z)
- direction: Richtung der Flächennormale (Physics.HitPhase.DIRECTION.POSITIVE oder Physics.HitPhase.DIRECTION.NEGATIVE)
- size: Größe der Fläche. [u,v]. Für Normale x: u=y, v=z; für Normale y: u=z, v=x; für Normale z: u=x, v=y.

## interface CollisionManager
### Boolean <- canTheyCollide(String body1id,String body2id, String hitPhase1id, String hitPhase2id)
Gibt true zurück, wenn sich Körper 1 mit Körper 2 Stoßen können soll, sonst false.  
Somit ist es möglich ein zu stellen, dass zwei Körper sich nicht Stoßen sollen.  
Es ist auch möglich für einzelne Begrenzungsflächen zu definieren, ob sie sich stoßen sollen oder nicht.

## interface CoefficientsManager
### Number <- getMy(String body1id,String body2id, String hitPhase1id, String hitPhase2id)
Gibt den Gleitreibungskoeffizienten für die Begrenzungsflächen der Körper 1 und 2 zurück.
### Number <- getK(String body1id,String body2id, String hitPhase1id, String hitPhase2id)
Gibt den Elastizizätskoeffizienten für die Begrenzungsflächen der Körper 1 und 2 zurück.
Ist dieser 0, ist der Stoß unelastisch. Wenn er 1 ist, ist er Vollelastisch. Alles dazwischen ist Teilellastisch.
