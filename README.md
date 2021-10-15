# ThePepegaWar
A miniture game for our multimedia project. We are using Web-GL and have a little bit fun while doing so.


Used Recources:
https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API  
https://glmatrix.net/  
https://www.youtube.com/playlist?list=PLjcVFFANLS5zH_PeKC6I8p0Pt1hzph_rt  
https://de.wikipedia.org/wiki/Wavefront_OBJ  
https://www.youtube.com/watch?v=ND86V8iglmE  

Farbpalette Imphenzia: https://www.youtube.com/channel/UCzfWju7SFoWLCyV_gDVCrGA

Physik:
https://www.lernhelfer.de/schuelerlexikon/physik-abitur/artikel/einteilung-von-stoessen

## [Hier ausprobieren](https://fjangfaragesh.github.io/ThePepegaWar/)

In der Levelauswahl mit W,A,S,D steuern. Leertaste zum Betreten eines Levels (derzeit öffnet überall nur eine Physik Demonstration).  
In der Physik Demonstration Kamera mit W,A,S,D,Shift,Leertaste steuern, Block mit T,F,G,H,U,J steuern, Musik mit R anschalten (Block ist Soundquelle. Dopplereffekt ist hörbar, wenn sich der Block bewegt. Die Geschwindigkeit der Kamera hat keinen Einfluss auf den Dopplereffekt.

## Dateien

In [docs](docs) befindet sich die Dokumentation.  
In [src](src) befindet sich der JavaScript Code.  
In [assets](assets) befinden sich alle Resourcen (Texturen, Audios, Modelle, Shader)
In [assets_dev](assets_dev) befinden sich Arbeitsdateien für die Resourcen (blender Dateien, LMMS Dateien, ...)

## Aktueller Stand

Die Implementation der [Physik](docs/physics.md) ist fast fertig. Es fehlten nur noch, dass wenn sich Körper stoßen ein anderer Programmteil darauf reagieren kann, zum Beispiel wenn ein Gegner den Spieler berührt.

[ThreeDAudio](docs/ThreeDAudio.md) ist fertig.

[ThreeDGraphics](docs/threeDGraphics.md) ist teilweise ferig, jedoch fehlt zum Beispiel die Nachbearbeitung des Bildes mittels effekte (Blur, farbkorrektur, ...)

Die [Shader](docs/3dmaterialshader.md) für verschiendene Materialien existeren. Derzeit ist nur die Diffuse Beleuchtung mit einer unendlich weit entfernten Lichtquelle implementiert.

Für die [Musik](assets/audio/music) gibt es schon einige unfertige Ideen, hier ist aber auch noch viel Arbeit nötig.

Das Spiel an sich existiert noch nicht, es wurde versucht die Spiellogikarchitektur, Levelauswahl und die Levelarchitektur zu konzipieren, jedoch ist es viel zu kompliziert geworden, so dass es noch komplett überarbeitet werden muss. Zur Demonstration existert die Levelauswahl.
