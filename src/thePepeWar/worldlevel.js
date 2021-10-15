class WorldLevel {
    constructor(game, worldLevelNodes,currentNodeId, onActivateNode, decorationStructures) {
        this.game = game;
        
        this.camera = new TestCamera();
        this.camera.ang1 = 0.0;
        this.camera.ang2 = -10.0/180*Math.PI*2;
        this.ears = new ThreeDAudio.Ears([0,0,0], [0,0,0], [1,0,0]);
        
        this.msgQue = [];
        this.worldLevelNodes = worldLevelNodes;//inhalt konstant! bei Änderungen MUSS das WorldLevel neu erzeugt werden 
        
        this.currentNodeId = currentNodeId;
        this.nodeOld = currentNodeId;
        
        this.onActivateNode = onActivateNode;
        
        this.decorationStructures = decorationStructures;
        
        this.worldNodeStructures = [];
        let wnr = game.resourceLoader.getValue("3dRes:worldnode");
        for (let n of this.worldLevelNodes) {
            this.worldNodeStructures.push(new threeDGraphics.SimpleStructure(wnr,new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,n.x,n.y,n.z,1])));
        }
        
        this.playerPos = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0, 1,2,3, 1]);
        this.calcPlayerAndCamPos();
        this.playerStructure = new threeDGraphics.SimpleStructure(game.resourceLoader.getValue("3dRes:player"), this.playerPos);
        
        this.moveProgress = 1.0;
        this.moveProgressSpeed = 0.01;
    }
    getNodeById(nid) {
        for (let n of this.worldLevelNodes) if (nid === n.id) return n;
        return undefined;
    }
    
    
    join() {
        this.game.send(new Game.ThreeDGMessageClear());
        for (let ds of this.decorationStructures) this.game.send(new Game.ThreeDGMessageAddStructure(ds));
        for (let ws of this.worldNodeStructures) this.game.send(new Game.ThreeDGMessageAddStructure(ws));
        this.game.send(new Game.ThreeDGMessageAddStructure(this.playerStructure));
        this.game.send(new Game.ThreeDGMessageSetCamera(this.camera.updateMatrix()));
    }
    leave() {
        this.game.send(new Game.ThreeDGMessageClear());
    }
    close() {
        
    }
    tick() {
        //this.controlProvisorischC2();
        let queOld = this.msgQue;
        this.msgQue = [];
        for (let m of queOld) this.send2(m);
        
        this.controlProvisorischP2();
        this.moveProgress = Math.min(this.moveProgress+this.moveProgressSpeed,1.0);
    }
    draw() {
        this.calcPlayerAndCamPos();
        this.game.send(new Game.ThreeDGMessageSetCamera(this.camera.updateMatrix()));
        this.ears.setPosition([this.camera.pos[0],this.camera.pos[1],this.camera.pos[2]]);
        this.ears.setRightEarAxis([Math.cos(this.camera.ang1),0,-Math.sin(this.camera.ang1)]);
        this.game.send(new Game.ThreeDSMessageSetEars(this.ears));
    }
    
    send(levelMessage) {
        this.msgQue.push(levelMessage);
    }
    
    send2(levelMessage) {
        switch (levelMessage.type) {
            case "userinput":
                //this.controlProvisorischC(levelMessage);
                break;
            case "userinterfaceinteraction":
                
                break;
            case "playercontrol":
                
                break;
        }
    }
    controlProvisorischC(levelMessage) {
        if (levelMessage.source === "mouse") {
            if (levelMessage.action === "move") {
                this.camera.ctrlRot1(-RM_SPEED*levelMessage.deltaX*(this.game.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
                this.camera.ctrlRot2(-RM_SPEED*levelMessage.deltaY*(this.game.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
            }
        }
    }
    
    
    controlProvisorischC2() {
        if (this.game.userInputStatesManager.isKeyPressed(KEY_FWD)) this.camera.ctrlMove(0,0,-SPEED);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_LEFT)) this.camera.ctrlMove(-SPEED,0,0);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_BKWD)) this.camera.ctrlMove(0,0,SPEED);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_RIGHT)) this.camera.ctrlMove(SPEED,0,0);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_UP)) this.camera.ctrlMove(0,SPEED,0);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_DOWN)) this.camera.ctrlMove(0,-SPEED,0);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_R_UP)) this.camera.ctrlRot2(-R_SPEED);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_R_LEFT)) this.camera.ctrlRot1(-R_SPEED);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_R_DOWN)) this.camera.ctrlRot2(R_SPEED);
        if (this.game.userInputStatesManager.isKeyPressed(KEY_R_RIGHT)) this.camera.ctrlRot1(R_SPEED);
        this.camera.setFieldOfView((this.game.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 5/180*Math.PI : 60/180*Math.PI));
    }
    controlProvisorischP2() {
        if (this.game.userInputStatesManager.isKeyPressed(KEY_FWD)) this.movePlayer("fwd");
        if (this.game.userInputStatesManager.isKeyPressed(KEY_LEFT))this.movePlayer("left");
        if (this.game.userInputStatesManager.isKeyPressed(KEY_BKWD)) this.movePlayer("bwd");
        if (this.game.userInputStatesManager.isKeyPressed(KEY_RIGHT)) this.movePlayer("right");
        if (this.game.userInputStatesManager.isKeyPressed(KEY_UP)) this.activateNode();
    }
    activateNode() {
        if (this.moveProgress < 1.0) return;
        this.onActivateNode(this.currentNodeId);
    }
    
    movePlayer(dir) {
        if (this.moveProgress < 1.0) return;
        let n = this.getNodeById(this.currentNodeId);
        if (n === undefined) return;
        let next = undefined;
        switch (dir) {
            case "fwd":
                next = n.nextFwdId;
                break;
            case "bwd":
                next = n.nextBwdId;
                break;
            case "left":
                next = n.nextLeftId;
                break;
            case "right":
                next = n.nextRightId;
                break;
        }
        if (next !== undefined) {
            this.nodeOldId = this.currentNodeId;
            this.currentNodeId = next;
            this.moveProgress = 0.0;
            this.moveProgressSpeed = 0.02;
            let nNew = this.getNodeById(next);
            if (nNew === undefined) return;
            let r = Math.max(0.01,Math.sqrt((n.x-nNew.x)*(n.x-nNew.x) + (n.y-nNew.y)*(n.y-nNew.y) + (n.z-nNew.z)*(n.z-nNew.z)));
            this.moveProgressSpeed = 0.05/r;
        }
    }
    calcPlayerAndCamPos() {
        let n = this.getNodeById(this.currentNodeId);
        if (n === undefined) return;
        
        let x,y,z;
        if (this.moveProgress < 1.0) {
            let nOld = this.getNodeById(this.nodeOldId);
            if (nOld === undefined) return;
            x = n.x*this.moveProgress + nOld.x*(1.0-this.moveProgress);
            y = n.y*this.moveProgress + nOld.y*(1.0-this.moveProgress);
            z = n.z*this.moveProgress + nOld.z*(1.0-this.moveProgress);
        } else {
            x = n.x;
            y = n.y;
            z = n.z;
        }
        
        this.playerPos[12] = x;
        this.playerPos[13] = y;
        this.playerPos[14] = z;

        this.camera.pos[0] = ((x) + this.camera.pos[0]*9)/10;
        this.camera.pos[1] = ((y + 2.0) + this.camera.pos[1]*9)/10;
        this.camera.pos[2] = ((z + 4.0) + this.camera.pos[2]*9)/10;
    }
}

class WorldLevelNode {
    constructor(id, x,y,z, nextLeftId, nextRightId, nextBwdId, nextFwdId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        
        this.nextLeftId = nextLeftId;
        this.nextRightId = nextRightId;
        this.nextBwdId = nextBwdId;
        this.nextFwdId = nextFwdId;
    }
}

