# ThreeDGraphics
3d Grafik.

### WebGLRenderingContext <- ThreeDGraphics.initGL(Canvas canvas)
Erstellt den WebGLRenderingContext auf dem Canvas canvas.

## class ThreeDGraphics.World
### constructor(WebGLRenderingContext gl)
### void <- addStructure(ThreeDGraphics.Structure structure)
### void <- removeStructure(ThreeDGraphics.Structure structure)
### void <- setGlobalConfiguration(String id, any value)
Ändert eine Globale Konfiguration, welche an die Shader Programme weiter gegeben werden. Diese können zum Beispiel die Position der Lichtquelle sein. 
### void <- setCamera(Float32Array(16) matrix)
Aktuallisiert die Zuschauer Transformations Matrix.
### void <- draw()
Rendert die Szene

## interface ThreeDGraphics.Resource
Ein Anzeigbares Objekt
### async void <- init(WebGLRenderingContext gl)
### draw(Float32Array(16) mObject, {"confId1":confValue1, "confId2": confValue2} globalConfigurations)
Rendert die Resource mit der Transformation mObject. Aus globalConfigurations können weitere Parameter ausgelesen werden.

## class ThreeDGraphics.TexturedTrianglesResource
Zeigt Dreicke mit Texturkoordinaten an.
### constructor(Array triangles, Image image)
- triangles: Array mit den Dreiecken.  {"p1":{x,y,z,tx,ty,nx,ny,nz},"p2":...,"p3":...}  
p1,p2,p3 sind die Ecken. x,y,z sind die Koordinaten der ecken, tx,ty sind die Texturkoordinaten und nx,ny,nz sind die Normalenvektoren.
- image: HTML Image. Textur

## class ThreeDGraphics.ShaderTrianglesResource
### constructor(Array triangles, ShaderProgram program)
- triangles: Array mit den Dreiecken.  {"p1":{x,y,z,tx,ty,nx,ny,nz},"p2":...,"p3":...}  
- program: Shaderprogram, mit dem die Dreiecke angezeigt werden. Dieses kann auf die Eigenschaften vertPosition, vertTexCoord, vertNormale, mObject, mView, und time zugreifen.

## interface ThreeDGraphics.Structure
### Boolean isVisible()
gitb false zurück, wenn die Struktur unsichtbar ist, sonst true
### [Structure, ...] <- getSubStructures()
gitb ein Array mit unterstrukturen Zurück
### [Resource, ...] <- getRecources()
gibt ein Array aus Resourcen zurück
### Float32Array(16) <- getTransformation()
Gitb die Transformation der Struktur zurück. undefined als Rückgabe wird als Einheitsmatrix interpretiert.

## class ThreeDGraphics.SimpleStructure
### constructor(Resource resource, Float32Array(16) transformation)
### void <- setTransformation(Float32Array(16) transformation)
### void <- setResource(Resource resource)
