# (Physik) Materialien

Enthält PhysicsMaterials.CoefficientsManager, mit welchem es möglich ist Materialien einfacher zu vergeben. 

## class PhysicsMaterials.CoefficientsManager implements CoefficientsManager
### constructor()
### void <- addMaterial(PhysicsMaterials.Material material, String materialId)
Fügt ein neues Material hinzu.
### void <- useMaterial(String bodyOrPhaseId, String materialId)
Weist dem Gesammten Körper mit der Id bodyOrPhaseId oder der Fläche mit der Id bodyOrPhaseId das Material materialId zu. Das Material der Fläche überdeckt das Material des Körpers.
### String <- getUsedMaterialId(String bodyId, String hitPhaseId)
Gibt die Material Id der Fläche mit der Id hitPhaseId oder wenn diese nicht spezifiziert ist die Material Id des Körpers bodyId zurück.
Sollte der auch kein Material zugewiesen bekommen haben, wird PhysicsMaterials.DEFAULT_MATERIAL_ID zurück gegeben.
### PhysicsMaterials.Material <- getUsedMaterial(String bodyId, String hitPhaseId)
Siehe getUsedMaterialId, nur dass das Material selbst, anstatt seine Id zurück gegeben wird.

## class PhysicsMaterials.Material
### constructor(properties)
- properties: {"my":0.35,"k":0.4}  
- my: Gleitreibungskoeffizient  
- k: Elastizitätskoeffizient  
### void <- set(String propName, any value)
Überschreibt die Materialeigenschaft mit dem Namen propName ("my" oder "k"). value ist der neue Wert.
### any <- get(String propName)
Gibt die Materialeigenschaft mit dem Namen propName zurück.

## Liste an Vordefinierten Materialien
- PhysicsMaterials.MATERIALS.WOOD
- PhysicsMaterials.MATERIALS.ICE
- PhysicsMaterials.MATERIALS.RUBBER
- PhysicsMaterials.MATERIALS.METAL
