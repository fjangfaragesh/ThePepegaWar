# 3d Material Shader
[Siehe hier](assets/shader)  
Für die Materialien Stein, Sand, Wiese, Blätter, Magie und Stehedes Wasser exitieren spezielle Shader.
Für jeden Fragment werden die Originalkoordinaten im 3d Raum mit berechnet und an dieser Stelle die Farbe ausgelesen.  
Jedem Punkt im 3 Dimensionalen Raum wird mittels einer Kombination aus Noise Funktionen und anderen berechnungen eine Farbe Zugeordnet.
Schneidet eine Fläche durch den Raum, werden diese Farben auf die Fläche gezeichnet.
So ist es möglich ein Objekt in einem Material darzustelen, ohne dass Texturkoodinaten berechnet und eine Textur passend zur Form angefertigt werden müssen.
