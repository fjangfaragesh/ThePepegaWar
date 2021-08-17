const Game = {};

Game.Game = class {
    constructor(gl,audioCtx) {
        this.gl = gl;
        this.threeDWorld = new threeDGraphics.World(gl);
        this.threeDAudioPlayer = new ThreeDAudio.Player(audioCtx,["music","0","1","2","3"]);
        
        this.resourceLoader = new Loader.ResouceLoader();
        this.userInputStatesManager = new UserInput.StatesManager();
        
        this.threeDGMessageReceiver = new Game.ThreeDGMessageReceiver(this.threeDWorld);
        this.threeDSMessageReceiver = new Game.ThreeDSMessageReceiver(this.threeDAudioPlayer);
        
        let current = this;
        
        this.level = undefined;
        
        UserInput.init(function(userinputMessage) {
            current.userInputStatesManager.send(userinputMessage);
            if (current.level !== undefined) current.level.send(userinputMessage);
        });
    }
    //resources: object {"id":res,"id2":res2, ...}
    async loadResources(resources) {
        let kys = Object.keys(resources);
        for (let k of kys) this.resourceLoader.add(resources[k],k);
        await this.resourceLoader.loadAll();
    }
    
    
    send(message) {
        switch (message.type) {
            case "3dg":
                this.threeDGMessageReceiver.send(message);
                return;
            case "3ds":
                this.threeDSMessageReceiver.send(message);
                return
            default:
                console.log("unknown message type " + message.type);
        }
    }
    changeLevel(lvl) {
        if (this.level !== undefined) this.level.leave();
        this.level = lvl;
        if (!this.level.isInitialized()) this.level.init(this);
        this.level.join();
    }
    tick() {
        if (this.level !== undefined) this.level.tick();
        
    }
    draw() {
        if (this.level !== undefined) this.level.draw();
        this.threeDWorld.draw();
        this.threeDAudioPlayer.tick();
    }
}

Game.ThreeDGMessageReceiver = class {
    constructor(threeDWorld) {
        this.threeDWorld = threeDWorld;
    }
    send(threeDGMessage) {
        if (threeDGMessage.type !== "3dg") return;
        switch (threeDGMessage.action) {
            case "clear":
                //throw new Error("not implemented");
                return;
            case "addStructure":
                this.threeDWorld.addStructure(threeDGMessage.structure);
                return;            
            case "removeStructure":
                this.threeDWorld.removeStructure(threeDGMessage.structure);
                return;
            case "setCamera":
                this.threeDWorld.setCamera(threeDGMessage.matrix);
                return;
        }
    }
}

Game.ThreeDGMessage = class {
    constructor(action) {
        this.type = "3dg"
        this.action = action;
    }
}
Game.ThreeDGMessageClear = class extends Game.ThreeDGMessage {
    constructor() {super("clear")};
}
Game.ThreeDGMessageAddStructure = class extends Game.ThreeDGMessage {
    constructor(structure) {
        super("addStructure");
        this.structure = structure;
    }
}
Game.ThreeDGMessageRemoveStructure = class extends Game.ThreeDGMessage {
    constructor(structure) {
        super("removeStructure");
        this.structure = structure;
    }
}
Game.ThreeDGMessageSetCamera = class extends Game.ThreeDGMessage {
    constructor(matrix) {
        super("setCamera");
        this.matrix = matrix;
    }
}


Game.ThreeDSMessageReceiver = class {
    constructor(threeDAudioPlayer) {
        this.threeDAudioPlayer = threeDAudioPlayer;
    }
    send(threeDSMessage) {
        if (threeDSMessage.type !== "3ds") return;
        switch (threeDSMessage.action) {
            case "clear":
                throw new Error("not implemented");
                return;
            case "addPlayingSound":
                this.threeDAudioPlayer.addSound(threeDSMessage.sound,threeDSMessage.channel);
                return;
            case "setEars":
                this.threeDAudioPlayer.setEars(threeDSMessage.ears);
                return;
        }
    }
}

Game.ThreeDSMessage = class {
    constructor(action) {
        this.type = "3ds"
        this.action = action;
    }
}
Game.ThreeDSMessageClear = class extends Game.ThreeDSMessage {
    constructor() {super("clear")};
}
Game.ThreeDSMessageAddPlayingSound = class extends Game.ThreeDSMessage {
    constructor(sound,channel) {
        super("addPlayingSound");
        this.sound = sound;
        this.channel = channel;
    }
}
Game.ThreeDSMessageSetEars = class extends Game.ThreeDSMessage {
    constructor(ears) {
        super("setEars");
        this.ears = ears;
    }
}


