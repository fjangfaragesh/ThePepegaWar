# ThreeDAudio
Ein Stereo Audio Player.
Enthält verschiedene Audioquellen, die sich an verschiedenen Orten befinden können und eine Geschwindigkeit haben können.  
Weit entfernte Quellen erscheinen leiser, Stereo und Dopplereffekt wird unterstützt.

## class ThreeDAudio.Player
constructor(AudioContext audioContext, [String, ...] channelIds)
Erstellt einen Audio Player. channelIds ist ein Array und enthält die Ids aller Audio Kanäle.
In jedem Kanal kann sich nur eine Audio Quelle befinden.
### void <- addSound(PlayingSound playingSound, String/[String,...] channelId)
Spielt den Sound playingSound ab.  
Es wird der Sound channelId zugewiesen. Sollte in diesem Kanal noch ein anderer Sound abgespielt werden, wird dieser abgebrochen.
Wenn channelId ein Array ist, wird unter den Einträgen nach einem freien Kanal gesucht. Ist keiner frei wird der älteste aus dem Array verwendet.
### void <- setEars(ThreeDAudio.Ears ears)
Aktuallisiert die Zuhörerposition
### void tick()
Berechnet Lautstärke und Dopplereffekt neu. (Wenn Audioquellen eine Geschwindigkeit haben müssen diese manuell Bewegt werden. Diese Funktion bewegt diese nicht!)

## class ThreeDAudio.PlayingSound
Eine Audioquelle
### constructor(AudiBuffer audioBuffer, function onEndedF, [Number,Number,Number] position, [Number,Number,Number] velocity, Number volumne, Boolean loopEnable, Number loopStartTime)
- audioBuffer: [AudiBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) des Sounds
- onEndedF: diese Funktion wird ausgeführt, wenn das Abspielen beendet wurde
- position: Ort der Quelle. Wenn position=undefined, dann wird der Sound Global abgespielt. Dopplereffekt und Stereo ist deaktiviert und Lautstäke ist Ortsunabhängig
- velocity: Geschwindigkeit der Quelle
- volumne: Lautstärke der Quelle (am besten zwischen 0 und 1)
- loopEnable: wenn es true ist, wird am ende des Sounds zum Zeitpunkt loopStartTime zurück gespuhlt, sonst das Abspielen beendet
- loopStartTime: Zeitpunk des Beginnes der Schleife in Sekunden
### void <- setPosition([Number,Number,Number] position)
Aktuallisiert die Position der Quelle
### void <- setVelocity([Number,Number,Number] velocity)
Aktuallisiert die Geschwindigkeit der Quelle
### void <- stop()
Beendet das Abspielen

## class ThreeDAudio.Ears
Beschreibt den Zustand des Zuhörers.
### constructor([Number,Number,Number] position, [Number,Number,Number] velocity, [Number,Number,Number] rightEarAxis)
- positon: Ort des Zuhörers
- velocity: Geschwindigkeit des Zuhörers
- rightEarAxis: Richtungsvektor vom Mittelpunkt des Kopfes zum rechten Ohr
### void <- setPosition([Number,Number,Number] position)
### void <- setVelocity([Number,Number,Number] position)
### void <- setRightEarAxis[Number,Number,Number] position)
