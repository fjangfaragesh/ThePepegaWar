// I am a dumb reposetory test area
const SPEED = 0.05;
const R_SPEED = 0.02;
const RM_SPEED = 0.002;

const KEY_FWD = "KeyW";
const KEY_LEFT = "KeyA";
const KEY_BKWD = "KeyS";
const KEY_RIGHT = "KeyD";
const KEY_UP = "Space";
const KEY_DOWN = "ShiftLeft";
const KEY_R_UP = "ArrowUp";
const KEY_R_LEFT = "ArrowLeft";
const KEY_R_DOWN = "ArrowDown";
const KEY_R_RIGHT = "ArrowRight";
const KEY_ZOOM = "KeyC";

const KEY_ACTION_UP = "KeyU";
const KEY_ACTION_DOWN = "KeyJ";
const KEY_ACTION_LEFT = "KeyF";
const KEY_ACTION_RIGHT = "KeyH";
const KEY_ACTION_FWD = "KeyT";
const KEY_ACTION_BKWD = "KeyG";
const KEY_ACTION_STOP = "KeyR";


let glcanv = undefined;
let canvLockState = false;

console.log("Index.js is running...");
onload = async function() {
    glcanv = document.getElementById("canv");
    let gl = threeDGraphics.initGL(glcanv);
    let actx = new AudioContext();
    
    let game = new Game.Game(gl,actx);
    await game.loadResources({"gl":new Loader.LdResourceLoadFunction([] ,async function() {return gl},"GL")});
    await game.loadResources({"actx":new Loader.LdResourceLoadFunction([] ,async function() {return actx},"ACTX")});

    await game.loadResources(RESOURCES);
    
    let level = new TestLevel();
    game.changeLevel(level);
    
    function loop() {
        glcanv.width = window.innerWidth;
        glcanv.height = window.innerHeight;
        gl.viewport(0,0,window.innerWidth, window.innerHeight)
        game.level.camera.setWidthHightRatio(window.innerWidth/window.innerHeight);// scheiß code
        
        game.tick();
        game.draw();
    }
    setInterval(loop, 10);
    //onloadOld();
}
async function onloadOld() {
    let actx = new AudioContext();
    let b = await Loader.loadAudioBuffer("../assets/audio/music/A.mp3",actx);
    let aplayer = new ThreeDAudio.Player(actx,["background-music","lalala"]);
    let music = new ThreeDAudio.PlayingSound(b, undefined, [999,999,999],[0,0,0], 3.0, true, 0.0);
    aplayer.addSound(music,"background-music");
    
    let userInputStatesManager = new UserInput.StatesManager();
    
    
    let gl = threeDGraphics.initGL(document.getElementById("canv"));
    glcanv = document.getElementById("canv");
    let world = new threeDGraphics.World(gl);
    
    let loader = new Loader.ResouceLoader();
    loader.add(Loader.LdResourceLoadFunction([], async function() {return gl}, "GL"),"gl");
    loader.add(Loader.LdResourceLoadFunction([], async function() {return actx}, "ACTX"),"actx");
    loader.add(new Loader.LdResourceText("../assets/models/basic_shapes/cube_same_texture.obj"),"file:cube_same_texture.obj");
    loader.add(new Loader.LdResourceText("../assets/models/items/coin.obj"),"file:coin.obj");
    loader.add(new Loader.LdResourceText("../assets/models/creatures/scary_ghost.obj"),"file:scary_ghost.obj");
    loader.add(new Loader.LdResourceText("../assets/models/boxes/superbox_blue.obj"),"file:superbox_blue.obj");
    loader.add(new Loader.LdResourceText("../assets/models/boxes/bricks.obj"),"file:bricks.obj");
    loader.add(new Loader.LdResourceImage("../assets/textures/palettes/hsl.png"),"image:hsl");
    loader.add(new Loader.LdResourceImage("../assets/textures/palettes/hsl_desaturated.png"),"image:hsl_desaturated");
    loader.add(new Loader.LdResourceImage("../assets/textures/palettes/imphenzia.png"),"image:imphenzia");
    loader.add(new Loader.LdResourceImage("../assets/textures/test.png"),"image:test");
    loader.add(new Loader.LdResourceImage("../assets/textures/wuhu.png"),"image:whuh");

    loader.add(new TexturedTrianglesResourceLoader("file:superbox_blue.obj","image:imphenzia","gl"), "3dRes:superbox");
    loader.add(new TexturedTrianglesResourceLoader("file:bricks.obj","image:hsl_desaturated","gl"), "3dRes:bricks");
    loader.add(new TexturedTrianglesResourceLoader("file:coin.obj","image:hsl","gl"), "3dRes:coin");
    loader.add(new TexturedTrianglesResourceLoader("file:cube_same_texture.obj","image:test","gl"), "3dRes:test");
    loader.add(new TexturedTrianglesResourceLoader("file:scary_ghost.obj","image:whuh","gl"), "3dRes:whuh");

    
    await loader.loadAll();
    console.log("hau");
    /*
    let wuhu = new threeDGraphics.SimpleStructure(
            loader.getValue("3dRes:whuh"), 
            new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.5,-3,1])
        );
    world.addStructure(wuhu);
    world.addStructure(
        new threeDGraphics.SimpleStructure(
            loader.getValue("3dRes:superbox"), 
            new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1])
        )
    );
    let coin = new threeDGraphics.SimpleStructure(
            loader.getValue("3dRes:coin"), 
            new Float32Array([0.5,0,0,0, 0,0.5,0,0, 0,0,0.5,0, 0,1,0,1])
    );
    world.addStructure(coin);
        
    world.addStructure(
        new threeDGraphics.SimpleStructure(
            loader.getValue("3dRes:test"), 
            new Float32Array([0.5,0,0,0, 0,0.5,0,0, 0,0,0.5,0, 0,3,-2,1])
        )
    );*/

    let box1 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:superbox"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
    let box2 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:test"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
    let box3 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:bricks"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
    let box4 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:superbox"), new Float32Array([0.25,0,0,0, 0,4,0,0, 0,0,3,0, 0,0,0,1]));
    let bdrdbx = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:test"), new Float32Array([20,0,0,0, 0,1,0,0, 0,0,20,0, 0,-5.5,0,1]));
    world.addStructure(box1);
    world.addStructure(box2);
    world.addStructure(box3);
    world.addStructure(box4);
    world.addStructure(bdrdbx);

    let cam = new Camera();
    cam.ctrlMove(0,-4,0);
    checkIfCanvasIsLocked(glcanv);
    
    let camController = new CamController(cam,userInputStatesManager);
    
    
    let coeffMan = new PhysicsMaterials.CoefficientsManager();
    
    pworld = new Physics.World(undefined, coeffMan);
    b1 = new LoveCube("A",[0,1,0],[0,0,0],2,[1,1,1],false);
    b2 = new LoveCube("B",[0,-4,0],[0,0,0],1,[1,1,1],false);
    b3 = new LoveCube("C",[0,3,0],[0,0,0],8,[1,1,1],false);
    b4 = new LoveCube("D",[4,0,0],[0,0,0],50,[0.25,4,3],false);
    brdr = new BorderCube("Raum",[0,5,0],[0,0,0],1000000000,[20,20,20],true);
    pworld.bodys.push(b1);
    pworld.bodys.push(b2);
    pworld.bodys.push(b3);
    pworld.bodys.push(b4);
    pworld.bodys.push(brdr)
    pworld.calcPhasePairs();
    
    
    coeffMan.addMaterial(PhysicsMaterials.MATERIALS.WOOD,"wood");
    coeffMan.addMaterial(PhysicsMaterials.MATERIALS.ICE,"ice");
    coeffMan.addMaterial(PhysicsMaterials.MATERIALS.RUBBER,"rubber");
    coeffMan.addMaterial(PhysicsMaterials.MATERIALS.METAL,"metal");
    
    coeffMan.useMaterial("A","wood");
    coeffMan.useMaterial("B","rubber");
    coeffMan.useMaterial("C","rubber");
    coeffMan.useMaterial("D","metal");
    coeffMan.useMaterial("Raum","wood");
        
    function loop() {
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_LEFT)) b1.velocity[0] = (b1.velocity[0] - 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_RIGHT)) b1.velocity[0] = (b1.velocity[0] + 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_DOWN)) b1.velocity[1] = (b1.velocity[1] - 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_UP)) b1.velocity[1] = (b1.velocity[1] + 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_FWD)) b1.velocity[2] = (b1.velocity[2] - 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_BKWD)) b1.velocity[2] = (b1.velocity[2] + 1)*0.95;
        if (userInputStatesManager.isKeyPressed(KEY_ACTION_STOP)) b1.velocity = [0,0,0];



        
        pworld.tick(0.01);
        music.setPosition([b1.position[0],b1.position[1],b1.position[2]]);
        music.setVelocity([b1.velocity[0],b1.velocity[1],b1.velocity[2]]);
        
        aplayer.ears.setPosition([cam.pos[0],cam.pos[1],cam.pos[2]]);
        aplayer.ears.setRightEarAxis([Math.cos(cam.ang1),0,Math.sin(cam.ang1)]);
        aplayer.tick();
        
        box1.getTransformation()[12] = b1.position[0];
        box1.getTransformation()[13] = b1.position[1];
        box1.getTransformation()[14] = b1.position[2];
        
        box2.getTransformation()[12] = b2.position[0];
        box2.getTransformation()[13] = b2.position[1];
        box2.getTransformation()[14] = b2.position[2];
        
        box3.getTransformation()[12] = b3.position[0];
        box3.getTransformation()[13] = b3.position[1];
        box3.getTransformation()[14] = b3.position[2];
        
        box4.getTransformation()[12] = b4.position[0];
        box4.getTransformation()[13] = b4.position[1];
        box4.getTransformation()[14] = b4.position[2];
        
        //bdrdbx.getTransformation()[12] = brdr.position[0];
        //bdrdbx.getTransformation()[13] = brdr.position[1];
        //bdrdbx.getTransformation()[14] = brdr.position[2];
        // glMatrix.mat4.rotateY(coin.getTransformation(),coin.getTransformation(),0.0134);
        // glMatrix.mat4.rotateY(wuhu.getTransformation(),wuhu.getTransformation(),-0.0461);
        glcanv.width = window.innerWidth;
        glcanv.height = window.innerHeight;
        gl.viewport(0,0,window.innerWidth, innerHeight)
        cam.setWidthHightRatio(window.innerWidth/window.innerHeight);
        camController.tick();
        world.setCamera(cam.updateMatrix());
        world.draw();
    }
    setInterval(loop, 10);
    
    function onUserInput(message) {
        userInputStatesManager.send(message);
        camController.send(message);
//        console.log(message);
    }
    
    
    UserInput.init(onUserInput);

    //pworld.tick(10);
    
}

class Camera{
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
        glMatrix.mat4.invert(this.matrix, this.matrix)
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
        this.ang3 = (Math.PI2 + this.ang3)%(Math.PI2);
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

class CamController {
    constructor(cam,userInputStatesManager) {
        this.cam = cam;
        this.userInputStatesManager = userInputStatesManager;
    }
    send(message) {
        if (message.type !== "userinput") return;
        if (message.source === "mouse") if (message.action === "move") {
            if(!canvLockState) { return }
            this.cam.ctrlRot1(-RM_SPEED*message.deltaX*(this.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
            this.cam.ctrlRot2(-RM_SPEED*message.deltaY*(this.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
        }
    }
    tick() {
        if (this.userInputStatesManager.isKeyPressed(KEY_FWD)) this.cam.ctrlMove(0,0,-SPEED);
        if (this.userInputStatesManager.isKeyPressed(KEY_LEFT)) this.cam.ctrlMove(-SPEED,0,0);
        if (this.userInputStatesManager.isKeyPressed(KEY_BKWD)) this.cam.ctrlMove(0,0,SPEED);
        if (this.userInputStatesManager.isKeyPressed(KEY_RIGHT)) this.cam.ctrlMove(SPEED,0,0);
        if (this.userInputStatesManager.isKeyPressed(KEY_UP)) this.cam.ctrlMove(0,SPEED,0);
        if (this.userInputStatesManager.isKeyPressed(KEY_DOWN)) this.cam.ctrlMove(0,-SPEED,0);
        if (this.userInputStatesManager.isKeyPressed(KEY_R_UP)) this.cam.ctrlRot2(-R_SPEED);
        if (this.userInputStatesManager.isKeyPressed(KEY_R_LEFT)) this.cam.ctrlRot1(-R_SPEED);
        if (this.userInputStatesManager.isKeyPressed(KEY_R_DOWN)) this.cam.ctrlRot2(R_SPEED);
        if (this.userInputStatesManager.isKeyPressed(KEY_R_RIGHT)) this.cam.ctrlRot1(R_SPEED);
        this.cam.setFieldOfView( (this.userInputStatesManager.isKeyPressed(KEY_ZOOM) ? 5/180*Math.PI : 60/180*Math.PI) )
    }
}

function checkIfCanvasIsLocked(canvas) {
    // Source - https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API 
    if ("onpointerlockchange" in document) {
        document.addEventListener('pointerlockchange', lockChangeAlert, false);
      } else if ("onmozpointerlockchange" in document) {
        document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
      }
      
      function lockChangeAlert() {
        if(document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas) {
          console.log('The pointer lock status is now locked');
          // Do something useful in response
          canvLockState = true;
        } else {
          console.log('The pointer lock status is now unlocked');
          // Do something useful in response
          canvLockState = false; 
        }
    }
}


// kommt noch wo anders hin...
class TexturedTrianglesResourceLoader extends Loader.LdResource {
    constructor(idObjFile,idImg,idGl) {
        super([idObjFile,idImg,idGl],"3dRes")
        this.idObjFile = idObjFile;
        this.idImg = idImg;
        this.idGl = idGl;
    }
    async loadFunction(dep) {
        let ret = new threeDGraphics.TexturedTrianglesResource(
            ObjLoader.loadObjFromString(dep[this.idObjFile]).generateTriangles(),
            dep[this.idImg]
        );
        ret.init(dep[this.idGl]);
        return ret;
    }
}
class GlRes extends Loader.LdResource {
    constructor(gl) {
        super([]);
        this.gl = gl;
    }
    async loadFunction(dep) {
        return this.gl;
    }
}


class LoveCube extends Physics.Body {
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

class BorderCube extends Physics.Body {
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

const RESOURCES = {
    "file:cube_same_texture.obj":   new Loader.LdResourceText("../assets/models/basic_shapes/cube_same_texture.obj"),
    "file:coin.obj":                new Loader.LdResourceText("../assets/models/items/coin.obj"),
    "file:superbox_blue.obj":       new Loader.LdResourceText("../assets/models/boxes/superbox_blue.obj"),
    "file:bricks.obj":              new Loader.LdResourceText("../assets/models/boxes/bricks.obj"),
    "image:hsl":                    new Loader.LdResourceImage("../assets/textures/palettes/hsl.png"),
    "image:hsl_desaturated":        new Loader.LdResourceImage("../assets/textures/palettes/hsl_desaturated.png"),
    "image:imphenzia":              new Loader.LdResourceImage("../assets/textures/palettes/imphenzia.png"),
    "image:test":                   new Loader.LdResourceImage("../assets/textures/test.png"),
    "3dRes:superbox":               new TexturedTrianglesResourceLoader("file:superbox_blue.obj","image:imphenzia","gl"),
    "3dRes:bricks":                 new TexturedTrianglesResourceLoader("file:bricks.obj","image:hsl_desaturated","gl"),
    "3dRes:coin":                   new TexturedTrianglesResourceLoader("file:coin.obj","image:hsl","gl"),
    "3dRes:test":                   new TexturedTrianglesResourceLoader("file:cube_same_texture.obj","image:test","gl"),
    "sound:hallo":                  new Loader.LdResourceAudioBuffer("../assets/audio/music/A.mp3","actx")
};

