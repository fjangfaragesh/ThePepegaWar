// kommt wieder in den Restmülleimer:

class TestLevel {
    constructor() {
        this.game = undefined;
        this.msgQue = [];
        this.pworld = new Physics.World(undefined, undefined);
    }
    isInitialized() {
        return this.game !== undefined;
    }
    
    init(game) {
        this.game = game;
        this.gameObjects = [];
        this.player = new TestPlayer("player",this.game,this, 0,0,0);
        this.gameObjects.push(this.player);
                
        this.gameObjects.push(new TestBoden("boden",this.game,this, 0,-2,0));
        this.gameObjects.push(new TestBox("a",this.game,this, 0.1,3,0.1, "3dRes:demo_stone_box", 10));
        this.gameObjects.push(new TestBox("b",this.game,this, -0.1,4.5,0.1, "3dRes:demo_sand_box", 10));
        this.gameObjects.push(new TestBricksBlock("c", this.game, this, 2.0, 1.0, 1.0));
        this.gameObjects.push(new TestBox("d",this.game,this, -0.1,4.5,2.1, "3dRes:demo_water_box", 10));
        this.gameObjects.push(new TestBox("e",this.game,this, -2.1,4.5,4.1, "3dRes:demo_magic_box", 10));
        this.gameObjects.push(new TestBox("f",this.game,this, -3.6,4.5,4.1, "3dRes:demo_leaves_box", 10));

        
        
        this.camera = new TestCamera();
        this.ears = new ThreeDAudio.Ears([0,0,0], [0,0,0], [1,0,0]);
    }
    join() {
        this.game.send(new Game.ThreeDGMessageClear());
        for (let o of this.gameObjects) o.activate();
        this.game.send(new Game.ThreeDGMessageSetCamera(this.camera.updateMatrix()));
    }
    leave() {
        for (let o of this.gameObjects) o.deactivate();
        this.game.send(new Game.ThreeDGMessageClear());
    }
    close() {
        
    }
    tick() {
        this.pworld.calcPhasePairs();// meeeh... das jeden zu tick machen :(
        this.pworld.tick(0.01);
        
        this.controlProvisorisch2();
        
        let queOld = this.msgQue;
        this.msgQue = [];
        for (let m of queOld) this.send2(m);
        
        for (let o of this.gameObjects) o.tick();
        
    }
    draw() {
        for (let o of this.gameObjects) o.refresh();
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
                this.controlProvisorisch(levelMessage);
                break;
            case "userinterfaceinteraction":
                
                break;
            case "sound":
                
                break;
            case "touch":
                
                break;
            case "playercontrol":
                
                break;
        }
    }
    controlProvisorisch(levelMessage) {
        if (levelMessage.source === "mouse") {
            if (levelMessage.action === "move") {
                this.camera.ctrlRot1(-RM_SPEED*levelMessage.deltaX*(this.game.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
                this.camera.ctrlRot2(-RM_SPEED*levelMessage.deltaY*(this.game.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
            }
        }
    }
    controlProvisorisch2() {
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
        
        let moveX = 0.0;
        let moveZ = 0.0;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_LEFT)) moveX--;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_RIGHT)) moveX++;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_FWD)) moveZ--;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_BKWD)) moveZ++;
        
        this.player.pbody.velocity[0] += (moveX*Math.cos(this.camera.ang1) + moveZ*Math.sin(this.camera.ang1))/2;
        this.player.pbody.velocity[2] += (-moveX*Math.sin(this.camera.ang1) + moveZ*Math.cos(this.camera.ang1))/2;
        
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_DOWN)) this.player.pbody.velocity[1] = (this.player.pbody.velocity[1] - 1)*0.95;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_UP)) this.player.pbody.velocity[1] = (this.player.pbody.velocity[1] + 1)*0.95;
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_STOP)) this.player.pbody.velocity = [0,0,0];
        
        if (this.game.userInputStatesManager.isKeyPressed(KEY_ACTION_STOP)) this.player.talk();
    }
    
}

class TestGameObject {
    constructor(id,game,level) {
        this.id = id;
        this.game = game;
        this.level = level;
    }
    send(levelMessage) {
        
    }
    activate() {
        
    }
    deactivate() {
        
    }
    refresh() {
        
    }
    tick() {

    }
}






class TestPlayer extends TestGameObject {
    constructor(id,game,level, x,y,z) {
        super(id,game,level);
        
        this.pbody = new BoxBody(id, [x,y,z], [0,0,0], TestPlayer.MASS, [1,1,1] ,false);
        
        this.level.pworld.bodys.push(this.pbody);//naja
        
        
        this.baseTrans = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
        this.structure = new threeDGraphics.SimpleStructure(game.resourceLoader.getValue("3dRes:superbox"), new Float32Array(16));
        
        this.soundExtension = new SoundExtension(this);
        this.isTalking = false;
        
        
        this.halloSound = this.game.resourceLoader.getValue("sound:hallo");
        
    }
    send(levelMessage) {
        if (levelMessage.type === "playercontrol") {
            //TODO
            console.log(levelMessage);
        }
    }
    activate() {
        super.deactivate();
        this.soundExtension.activate();
        this.game.send(new Game.ThreeDGMessageAddStructure(this.structure));
    }
    deactivate() {
        super.activate();
        this.soundExtension.deactivate();
        this.game.send(new Game.ThreeDGMessageRemoveStructure(this.structure));
    }
    refresh() {
        super.refresh();
        threeDGPosUpdate(this.pbody.position, this.structure.getTransformation(),this.baseTrans);
        this.soundExtension.refresh(this.pbody.position, this.pbody.velocity);
        
    }
    tick() {
        
    }
    
    
    talk() {
        let current = this;
        if (!this.isTalking) {
            this.isTalking = true;
            this.soundExtension.play(this.halloSound, 10.0, ["0","1","2","3"], true, 0.0, function() {current.isTalking = false}, this.pbody.position, this.pbody.velocity);
        }
    }
    
    
    playSound(audioBufferResId, volumne, channelId, loopEnable, loopStartTime, onEndedF) {
        let current = this;
        let s;
        let onEnded = function() {
            let i = current.sounds.indexOf(s);
            if (i !== -1) current.sounds.splice(i,1);
            if (onEndedF !== undefined) onEndedF();
        }
        s = new ThreeDAudio.PlayingSound(this.game.resourceLoader.getValue(audioBufferResId), onEnded, this.pbody.position, this.pbody.velocity, volumne, loopEnable, loopStartTime);
        
        this.sounds.push(s);
        this.game.send(new Game.ThreeDSMessageAddPlayingSound(s,channelId));
    }
}
TestPlayer.MASS = 70;


class TestBox extends TestGameObject {
    constructor(id,game,level, x,y,z, resId, mass) {
        super(id,game,level);
        
        let dimensions = [Math.random()*0.5 + 0.75, Math.random()*0.5 + 0.75, Math.random()*0.5 + 0.75];
        
        this.pbody = new BoxBody(id, [x,y,z], [0,0,0],mass, dimensions ,false);
        
        this.level.pworld.bodys.push(this.pbody);//naja
        
        
        this.baseTrans = new Float32Array([dimensions[0],0,0,0, 0,dimensions[1],0,0, 0,0,dimensions[2],0, 0,0,0,1]);
        this.structure = new threeDGraphics.SimpleStructure(game.resourceLoader.getValue(resId), new Float32Array(16));
        
        this.soundExtension = new SoundExtension(this);
        this.isTalking = false;
        
        
        this.halloSound = this.game.resourceLoader.getValue("sound:hallo");
        
    }
    send(levelMessage) {
        if (levelMessage.type === "playercontrol") {
            //TODO
            console.log(levelMessage);
        }
    }
    activate() {
        super.deactivate();
        this.soundExtension.activate();
        this.game.send(new Game.ThreeDGMessageAddStructure(this.structure));
    }
    deactivate() {
        super.activate();
        this.soundExtension.deactivate();
        this.game.send(new Game.ThreeDGMessageRemoveStructure(this.structure));
    }
    refresh() {
        super.refresh();
        threeDGPosUpdate(this.pbody.position, this.structure.getTransformation(),this.baseTrans);
        this.soundExtension.refresh(this.pbody.position, this.pbody.velocity);
        
    }
    tick() {
        
    }
    
    
    talk() {
        let current = this;
        if (!this.isTalking) {
            this.isTalking = true;
            this.soundExtension.play(this.halloSound, 10.0, ["0","1","2","3"], false, undefined, function() {current.isTalking = false}, this.pbody.position, this.pbody.velocity);
        }
    }
    
    
    playSound(audioBufferResId, volumne, channelId, loopEnable, loopStartTime, onEndedF) {
        let current = this;
        let s;
        let onEnded = function() {
            let i = current.sounds.indexOf(s);
            if (i !== -1) current.sounds.splice(i,1);
            if (onEndedF !== undefined) onEndedF();
        }
        s = new ThreeDAudio.PlayingSound(this.game.resourceLoader.getValue(audioBufferResId), onEnded, this.pbody.position, this.pbody.velocity, volumne, loopEnable, loopStartTime);
        
        this.sounds.push(s);
        this.game.send(new Game.ThreeDSMessageAddPlayingSound(s,channelId));
    }
}



class TestBoden extends TestGameObject {
    constructor(id,game,level, x,y,z) {
        super(id,game,level);
        
        this.pbody = new BoxBody(id, [x,y,z], [0,0,0], 99999999, [10,1,10] , true);        
        this.level.pworld.bodys.push(this.pbody);//naja
        
        
        this.strTrans = new Float32Array(16);
        this.structure = new threeDGraphics.SimpleStructure(game.resourceLoader.getValue("3dRes:demo_grass_box"), this.strTrans);
        
    }
    send(levelMessage) {
        if (levelMessage.type === "playercontrol") {
            //TODO
            console.log(levelMessage);
        }
    }
    activate() {
        this.game.send(new Game.ThreeDGMessageAddStructure(this.structure));
    }
    deactivate() {
        this.game.send(new Game.ThreeDGMessageRemoveStructure(this.structure));
    }
    refresh() {
        this.strTrans[0] = 10.0;
        this.strTrans[1] = 0.0;
        this.strTrans[2] = 0.0;
        this.strTrans[3] = 0.0;
        this.strTrans[4] = 0.0;
        this.strTrans[5] = 1.0;
        this.strTrans[6] = 0.0;
        this.strTrans[7] = 0.0;
        this.strTrans[8] = 0.0;
        this.strTrans[9] = 0.0;
        this.strTrans[10] = 10.0;
        this.strTrans[11] = 0.0;
        this.strTrans[12] = this.pbody.position[0];
        this.strTrans[13] = this.pbody.position[1];
        this.strTrans[14] = this.pbody.position[2];
        this.strTrans[15] = 1.0; 
        this.structure.setTransformation(this.strTrans);
    }
}

class TestBricksBlock extends TestGameObject {
    constructor(id,game,level, x,y,z) {
        super(id,game,level);
        this.pbody = new Physics.Body(id, [x,y,z], [0,0,0], 99999999, true);
        this.pbody.setHitPhases(parsePhases(game.resourceLoader.getValue("file:1x1box.phases.txt"), this.pbody));
        
        
        this.level.pworld.bodys.push(this.pbody);//naja
        
        this.structure = new threeDGraphics.SimpleStructure(game.resourceLoader.getValue("3dRes:bricks"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]));
        
    }
    send(levelMessage) {

    }
    activate() {
        this.game.send(new Game.ThreeDGMessageAddStructure(this.structure));
    }
    deactivate() {
        this.game.send(new Game.ThreeDGMessageRemoveStructure(this.structure));
    }
    refresh() {
        // nichts tun, die Position wird sich NIE ändern
    }
}









class TestCamera {
    constructor() {
        this.pos = new Float32Array([0,0,5,1]);
        this.base = new Float32Array(16);
        glMatrix.mat4.identity(this.base);
        this.ang1 = 0;      // at first: rotate on y axis (body rotation in plane)
        this.ang2 = 0;      // then rotate on x axis (head up/down)
        this.ang3 = 0;      // then rotate on z axis (tilt head)
        this.matrix = new Float32Array(16);
        this.matInternal = new Float32Array(16);
        this.fieldOfView = (60*Math.PI)/180; // field of view
        this.viewMax = 1000; // maximal view distance
        this.viewMin = 0.01; // minimal view distance
        this.projectionsMatrix = new Float32Array(16);
        this.widthHightRatio = 1;
    }
    updateMatrix() {
        glMatrix.mat4.identity(this.matrix);
        glMatrix.mat4.translate(this.matrix,this.matrix, this.pos);
        glMatrix.mat4.rotateY(this.matrix,this.matrix, this.ang1);
        glMatrix.mat4.rotateX(this.matrix,this.matrix, this.ang2);
        glMatrix.mat4.rotateZ(this.matrix,this.matrix, this.ang3);
        glMatrix.mat4.invert(this.matrix, this.matrix);
        glMatrix.mat4.perspective(this.projectionsMatrix, this.fieldOfView, this.widthHightRatio, this.viewMin, this.viewMax);
        glMatrix.mat4.multiply(this.matrix, this.projectionsMatrix, this.matrix);
        return this.matrix;
    }

    ctrlMove(distanceRight,distanceUp,distanceFwd) {
        glMatrix.mat4.copy(this.matInternal,this.base);
        glMatrix.mat4.rotateY(this.matInternal,this.matInternal, this.ang1);
        let iiii = new Float32Array(4);
        glMatrix.vec4.transformMat4(iiii, [distanceRight,distanceUp,distanceFwd,1.0], this.matInternal);
        glMatrix.vec4.add(this.pos, this.pos, iiii);
    }
    ctrlRot1(angle) {
        this.ang1 += angle;
        this.ang1 = (Math.PI*2 + this.ang1)%(Math.PI*2);
    }
    ctrlRot2(angle) {
        this.ang2 += angle;
        this.ang2 = Math.min(Math.PI/2,Math.max(-Math.PI/2,this.ang2));
    }
    ctrlRot3(angle) {
        this.ang3 += angle;
        this.ang3 = (Math.PI*2 + this.ang3)%(Math.PI*2);
    }

    setFieldOfView(foV){
        this.fieldOfView = foV;
    }
    setMinMax(min,max){
        this.viewMax = max;
        this.viewMin = min;
    }
    setWidthHightRatio(ratio) {
        this.widthHightRatio = ratio;
    }
}


class BoxBody extends Physics.Body {
    constructor(id,position, velocity, mass, size, sink) {
        super(id,position, velocity, mass, sink);
        this.size = size;
        this.setHitPhases([
            new Physics.HitPhase(id+":left",this,[-size[0]/2,0,0],Physics.HitPhase.AXIS.X,Physics.HitPhase.DIRECTION.NEGATIVE,[size[1],size[2]]),
            new Physics.HitPhase(id+":right",this,[size[0]/2,0,0],Physics.HitPhase.AXIS.X,Physics.HitPhase.DIRECTION.POSITIVE,[size[1],size[2]]),
            new Physics.HitPhase(id+":bottom",this,[0,-size[1]/2,0],Physics.HitPhase.AXIS.Y,Physics.HitPhase.DIRECTION.NEGATIVE,[size[2],size[0]]),
            new Physics.HitPhase(id+":top",this,[0,size[1]/2,0],Physics.HitPhase.AXIS.Y,Physics.HitPhase.DIRECTION.POSITIVE,[size[2],size[0]]),
            new Physics.HitPhase(id+":front",this,[0,0,-size[2]/2],Physics.HitPhase.AXIS.Z,Physics.HitPhase.DIRECTION.NEGATIVE,[size[0],size[1]]),
            new Physics.HitPhase(id+":back",this,[0,0,size[2]/2],Physics.HitPhase.AXIS.Z,Physics.HitPhase.DIRECTION.POSITIVE,[size[0],size[1]]),
        ]);
    }
}

class BorderBoxBody extends Physics.Body {
    constructor(id,position, velocity, mass, size, sink) {
        super(id,position, velocity, mass, sink);
        this.size = size;
        this.setHitPhases([
            new Physics.HitPhase(id+":left",this,[-size[0]/2,0,0],Physics.HitPhase.AXIS.X,Physics.HitPhase.DIRECTION.POSITIVE,[size[1],size[2]]),
            new Physics.HitPhase(id+":right",this,[size[0]/2,0,0],Physics.HitPhase.AXIS.X,Physics.HitPhase.DIRECTION.NEGATIVE,[size[1],size[2]]),
            new Physics.HitPhase(id+":bottom",this,[0,-size[1]/2,0],Physics.HitPhase.AXIS.Y,Physics.HitPhase.DIRECTION.POSITIVE,[size[2],size[0]]),
            new Physics.HitPhase(id+":top",this,[0,size[1]/2,0],Physics.HitPhase.AXIS.Y,Physics.HitPhase.DIRECTION.NEGATIVE,[size[2],size[0]]),
            new Physics.HitPhase(id+":front",this,[0,0,-size[2]/2],Physics.HitPhase.AXIS.Z,Physics.HitPhase.DIRECTION.POSITIVE,[size[0],size[1]]),
            new Physics.HitPhase(id+":back",this,[0,0,size[2]/2],Physics.HitPhase.AXIS.Z,Physics.HitPhase.DIRECTION.NEGATIVE,[size[0],size[1]]),
        ]);
    }
}

// line:      "subid x y z ND u v"    example: "left -0.5 0.0 0.0 X+ 1.0 1.0"
// N: Normale Axis (X / Y / Z)   D: Direction (+ / -)
function parsePhase(line, body) {
    let wds = line.replace(/\s{2,}/g, ' ').split(" ");
    
    let id = body.id + ":" + wds[0];
    let x = wds[1]*1;
    let y = wds[2]*1;
    let z = wds[3]*1
    let ax = Physics.HitPhase.AXIS[wds[4][0]];
    let dir = parsePhaseDir[wds[4][1]];
    let u = wds[5]*1;
    let v = wds[6]*1;
    if (isNaN(x)) throw new Error("can't parse " + line + " " + wds[1] + " is not a number");
    if (isNaN(y)) throw new Error("can't parse " + line + " " + wds[2] + " is not a number");
    if (isNaN(z)) throw new Error("can't parse " + line + " " + wds[3] + " is not a number");
    if (ax === undefined) throw new Error("can't parse " + line + " " + wds[4][0] + " is not a axis");
    if (dir === undefined) throw new Error("can't parse " + line + " " + wds[4][1] + " is not a direction");
    if (isNaN(u)) throw new Error("can't parse " + line + " " + wds[5] + " is not a number");
    if (isNaN(v)) throw new Error("can't parse " + line + " " + wds[6] + " is not a number");
    return new Physics.HitPhase(id,body,[x,y,z],ax,dir,[u,v]);
}
const parsePhaseDir = {"+": Physics.HitPhase.DIRECTION.POSITIVE,"-":Physics.HitPhase.DIRECTION.NEGATIVE};


function parsePhases(str, body) {
    let ret = [];
    let lines = str.replace(/[\r\n]{2,}/g, "\n").split("\n");
    for (let l of lines) {
        if (l !== "") ret.push(parsePhase(l,body));
    }
    return ret;
}

function threeDGPosUpdate(pos, positionMatrix, baseMatrix) {
    glMatrix.mat4.fromTranslation(positionMatrix,pos);
    glMatrix.mat4.multiply(positionMatrix,positionMatrix,baseMatrix);
}



class SoundExtension {
    constructor(gameObject) {
        this.gameObject = gameObject;
        this.sounds = [];
    }
    
    play(audioBuffer, volumne, channelId, loopEnable, loopStartTime, onEndedF, position, velocity) {
        let current = this;
        let s;
        let onEnded = function() {
            let i = current.sounds.indexOf(s);
            if (i !== -1) current.sounds.splice(i,1);
            if (onEndedF !== undefined) onEndedF();
        }
        s = new ThreeDAudio.PlayingSound(audioBuffer, onEnded, position, velocity, volumne, loopEnable, loopStartTime);
        this.sounds.push(s);
        this.gameObject.game.send(new Game.ThreeDSMessageAddPlayingSound(s,channelId));
    }
    activate() {
        
    }
    deactivate() {
        for (let s of this.sounds) s.stop();
    }
    
    refresh(position, velocity) {
        for (let s of this.sounds) {
            s.setPosition(position);
            s.setVelocity(velocity);
        }
    }
}
