const PhysicsMaterials = {};

PhysicsMaterials.CoefficientsManager = class {
    constructor() {
        this.materials = {};
        this.addMaterial(new PhysicsMaterials.Material(),PhysicsMaterials.DEFAULT_MATERIAL_ID);
        this.uses = {};
    }
    addMaterial(m,id) {
        this.materials[id] = m;
    }
    useMaterial(bodyOrPhaseId, materialId) {
        this.uses[bodyOrPhaseId] = materialId;
    }    
    
    getUsedMaterialId(bodyId, hitPhaseId) {
        if (this.uses[hitPhaseId] !== undefined) return this.uses[hitPhaseId];
        if (this.uses[bodyId] !== undefined) return this.uses[bodyId];
        return PhysicsMaterials.DEFAULT_MATERIAL_ID;
    }
    getUsedMaterial(bodyId, hitPhaseId) {
        return this.getMaterialById(this.getUsedMaterialId(bodyId, hitPhaseId));
    }
    
    getMaterialById(id,  noDefaultIfNotExist) {
        if (this.materials[id] === undefined && !noDefaultIfNotExist) {
            return this.materials[PhysicsMaterials.DEFAULT_MATERIAL_ID];
        }
        return this.materials[id];
    }
    
    //from interface Physics.CoefficientsManager
    getMy(body1id,body2id, hitPhase1id, hitPhase2id) {
        let my1 = this.getUsedMaterial(body1id,hitPhase1id).get("my");
        let my2 = this.getUsedMaterial(body2id,hitPhase2id).get("my");
        return Math.sqrt(my1*my2);
    }
    getK(body1id,body2id, hitPhase1id, hitPhase2id) {
        let k1 = this.getUsedMaterial(body1id,hitPhase1id).get("k");
        let k2 = this.getUsedMaterial(body2id,hitPhase2id).get("k");
        return Math.sqrt(k1*k2);
    }
}
PhysicsMaterials.DEFAULT_MATERIAL_ID = "default";

PhysicsMaterials.Material = class {
    constructor(properties) {
        this.properties = properties ?? {};
        
        
        if (this.properties.my === undefined) this.properties.my = 0.5;
        if (this.properties.k === undefined) this.properties.k = 0.5;
    }
    set(propName, value) {
        this.properties[propName] = value;
    }
    get(propName) {
        return this.properties[propName];
    }
}

// https://www.schweizer-fn.de/stoff/reibwerte/reibwerte_gleitreibung.php
PhysicsMaterials.MATERIALS = {};
PhysicsMaterials.MATERIALS.WOOD = new PhysicsMaterials.Material({"my":0.35,"k":0.4});
PhysicsMaterials.MATERIALS.ICE = new PhysicsMaterials.Material({"my":0.01,"k":0.2});
PhysicsMaterials.MATERIALS.RUBBER = new PhysicsMaterials.Material({"my":0.72,"k":0.7});
PhysicsMaterials.MATERIALS.METAL = new PhysicsMaterials.Material({"my":0.10,"k":0.7});
