class GreenWorldLevel extends WorldLevel {
    constructor(game,gamedata) {
        
        let decoStructures = [new threeDGraphics.SimpleStructure(game.resourceLoader.getValue("3dRes:greenworld"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]))];
        
        super(game,GreenWorldLevel.NODES,"greenworld_level0",function(x) {alert(x); return false},decoStructures);
        
    }
    
}

GreenWorldLevel.NODES = [
    new WorldLevelNode("greenworld_level0", 4,0,-3, undefined, "greenworld_junction0", undefined, undefined),
    new WorldLevelNode("greenworld_junction0", 6,0,-3, "greenworld_level0", "greenworld_level1", undefined, "greenworld_shop"),
    new WorldLevelNode("greenworld_shop", 6,0,-5, undefined, undefined, "greenworld_junction0", undefined),
    new WorldLevelNode("greenworld_level1", 9,0,-2.5, "greenworld_junction0", "greenworld_level2", undefined, undefined),
    new WorldLevelNode("greenworld_level2", 13,0,-2, "greenworld_level1", "greenworld_level3", undefined, undefined),
    new WorldLevelNode("greenworld_level3", 16,0,-2, "greenworld_level2", "greenworld_level4", undefined, undefined),
    new WorldLevelNode("greenworld_level4", 20,0,-2, "greenworld_level3", "greenworld_level5", undefined, undefined),
    new WorldLevelNode("greenworld_level5", 24,0,-2, "greenworld_level4", "greenworld_level6", undefined, undefined),
    new WorldLevelNode("greenworld_level6", 27,0,-2, "greenworld_level5", "greenworld_level7", undefined, undefined),
    new WorldLevelNode("greenworld_level7", 30,0,-2, "greenworld_level6", undefined, undefined, "greenworld_dreamExit"),
    new WorldLevelNode("greenworld_dreamExit", 30,3.5,-7, undefined, undefined, "greenworld_level7", undefined)

    
]
