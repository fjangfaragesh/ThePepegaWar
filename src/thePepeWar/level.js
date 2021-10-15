class Level {
    constructor(game) {
        this.game = game;
        this.pworld = null;
        
    }
    join() {
        this.game.send(new Game.ThreeDGMessageClear());
        //for (let ds of this.decorationStructures) this.game.send(new Game.ThreeDGMessageAddStructure(ds));
        //for (let ws of this.worldNodeStructures) this.game.send(new Game.ThreeDGMessageAddStructure(ws));
        this.game.send(new Game.ThreeDGMessageSetCamera(this.camera.updateMatrix()));
    }
    leave() {
        this.game.send(new Game.ThreeDGMessageClear());
    }
    close() {
        
    }
    tick() {
        
        this.pworld.tick();
        
        //this.controlProvisorischC2();
        let queOld = this.msgQue;
        this.msgQue = [];
        for (let m of queOld) this.send2(m);
    }
    draw() {
        //this.game.send(new Game.ThreeDGMessageSetCamera(this.camera.updateMatrix()));
        //this.ears.setPosition([this.camera.pos[0],this.camera.pos[1],this.camera.pos[2]]);
        //this.ears.setRightEarAxis([Math.cos(this.camera.ang1),0,-Math.sin(this.camera.ang1)]);
        //this.game.send(new Game.ThreeDSMessageSetEars(this.ears));
    }
    
    send(levelMessage) {
        this.msgQue.push(levelMessage);
    }
    
    send2() {
        switch (levelMessage.type) {
            case "userinput":

                break;
            case "userinterfaceinteraction":
                
                break;
            case "playercontrol":
                
                break;
            case "3dp":
                
                break;
            case "3dpevent":
                
                break;
        }
    }
    
}
