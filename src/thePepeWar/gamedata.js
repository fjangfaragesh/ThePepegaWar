class ThePepeWarGameData {
    constructor() {
        this.playerLifes = 5;
        
        this.numberOfGoldCoinsInventory = 0;
        this.numberOfGoldCoinsBank = 0;
        
        this.collectedGoldCoinIds = [];
        
        this.numberOfSilverCoinsInventory = 0;
        this.numberOfGoldCoinsBank = 0;
        
        this.itemInventory = undefined;
        this.itemsBank = [];
        
        this.clearedNodeIds = [];// knoten, die betreten werden können
        this.clearedPathIds = [];// wege, die gegangen werden können "nodeId:pathDirection"
        
        this.currentWorldId = "greenworld";
        this.currentWorldNodeId = "greenworld_level0";
    }
    isGoldCollected(coinId) {
        return this.collectedGoldCoinIds.indexOf(coinId) !== -1;
    }
    
    isPathCleared(pathId) {
        return this.clearedPathIds.indexOf(pathId) !== -1;
    }
}
