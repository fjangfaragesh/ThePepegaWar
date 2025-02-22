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
    
    let level = new GreenWorldLevel(game, undefined);
    //let level = new TestLevel();
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
        await ret.init(dep[this.idGl]);
        return ret;
    }
}

// kommt noch wo anders hin...
class ShaderTrianglesResourceLoader extends Loader.LdResource {
    constructor(idObjFile,idProgram,idGl) {
        super([idObjFile,idProgram,idGl],"3dRes")
        this.idObjFile = idObjFile;
        this.idProgram = idProgram;
        this.idGl = idGl;
    }
    async loadFunction(dep) {
        let ret = new threeDGraphics.ShaderTrianglesResource(ObjLoader.loadObjFromString(dep[this.idObjFile]).generateTriangles(),dep[this.idProgram]);
        await ret.init(dep[this.idGl]);
        return ret;
    }
}
class ShadersTrianglesResourceLoader extends Loader.LdResource {
    constructor(idObjFile,programsId,idGl) {
        let dep = [idObjFile,idGl];
        let kys = Object.keys(programsId);
        for (let k of kys) dep.push(programsId[k]);
        super(dep);
        this.kys = kys;
        this.idObjFile = idObjFile;
        this.programsId = programsId;
        this.idGl = idGl;
    }
    async loadFunction(dep) {
        let shaderTrianglesResources = [];
        let o = ObjLoader.loadObjFromString(dep[this.idObjFile]);
        for (let k of this.kys) {
            let p = dep[this.programsId[k]];
            let r = new threeDGraphics.ShaderTrianglesResource(o.generateTrianglesFromMaterial(k),p);
            if (r.length !== 0) shaderTrianglesResources.push(r);
        }
        let ret = new threeDGraphics.ShadersTrianglesResource(shaderTrianglesResources);
        await ret.init(dep[this.idGl]);
        return ret;
    }
    
    
}


class ShaderProgramResourceLoader extends Loader.LdResource {
    constructor(idvshadercode, idfshadercode, idgl) {
        super([idvshadercode, idfshadercode, idgl],"shaderProgram");
        this.idvshadercode = idvshadercode;
        this.idfshadercode = idfshadercode;
        this.idgl = idgl;
        
    }
    async loadFunction(dep) {
        return threeDGraphics.createProgram(dep[this.idgl],dep[this.idvshadercode],dep[this.idfshadercode]);
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


const SHADER_MATERIAL_IDS = {
    "sand":"shader:sand",
    "water":"shader:water",
    "stone":"shader:stone",
    "grass":"shader:grass",
    "leaves":"shader:leaves",
    "bark":"shader:magic",
    "wood":"shader:magic",
    "magic":"shader:magic"
};

const RESOURCES = {
    "file:cube_same_texture.obj":   new Loader.LdResourceText("assets/models/basic_shapes/cube_same_texture.obj"),
    "file:coin.obj":                new Loader.LdResourceText("assets/models/items/coin.obj"),
    "file:superbox_blue.obj":       new Loader.LdResourceText("assets/models/boxes/superbox_blue.obj"),
    "file:bricks.obj":              new Loader.LdResourceText("assets/models/boxes/bricks.obj"),
    "file:player.obj":              new Loader.LdResourceText("assets/models/creatures/player.obj"),
    "file:worldnode.obj":           new Loader.LdResourceText("assets/models/world/worldnode.obj"),
    "file:greenworld.obj":          new Loader.LdResourceText("assets/models/world/greenworld/greenworld.obj"),
    "file:buildingTypeA.obj":       new Loader.LdResourceText("assets/models/buildings/buildingTypeA.obj"),
    
    "file:1x1box.phases.txt":       new Loader.LdResourceText("assets/models/boxes/1x1box.phases.txt"),

    
    "file:stone.v.glsl":            new Loader.LdResourceText("assets/shader/stone/stone.v.glsl"),
    "file:stone.f.glsl":            new Loader.LdResourceText("assets/shader/stone/stone.f.glsl"),
    "shader:stone":                 new ShaderProgramResourceLoader("file:stone.v.glsl","file:stone.f.glsl","gl"),
    
    "file:sand.v.glsl":             new Loader.LdResourceText("assets/shader/sand/sand.v.glsl"),
    "file:sand.f.glsl":             new Loader.LdResourceText("assets/shader/sand/sand.f.glsl"),
    "shader:sand":                  new ShaderProgramResourceLoader("file:sand.v.glsl","file:sand.f.glsl","gl"),
    
    "file:water.v.glsl":            new Loader.LdResourceText("assets/shader/water/water.v.glsl"),
    "file:water.f.glsl":            new Loader.LdResourceText("assets/shader/water/water.f.glsl"),
    "shader:water":                 new ShaderProgramResourceLoader("file:water.v.glsl","file:water.f.glsl","gl"),
    
    "file:magic.v.glsl":            new Loader.LdResourceText("assets/shader/magic/magic.v.glsl"),
    "file:magic.f.glsl":            new Loader.LdResourceText("assets/shader/magic/magic.f.glsl"),
    "shader:magic":                 new ShaderProgramResourceLoader("file:magic.v.glsl","file:magic.f.glsl","gl"),

    "file:grass.v.glsl":            new Loader.LdResourceText("assets/shader/grass/grass.v.glsl"),
    "file:grass.f.glsl":            new Loader.LdResourceText("assets/shader/grass/grass.f.glsl"),
    "shader:grass":                 new ShaderProgramResourceLoader("file:grass.v.glsl","file:grass.f.glsl","gl"),
    
    "file:leaves.v.glsl":            new Loader.LdResourceText("assets/shader/leaves/leaves.v.glsl"),
    "file:leaves.f.glsl":            new Loader.LdResourceText("assets/shader/leaves/leaves.f.glsl"),
    "shader:leaves":                 new ShaderProgramResourceLoader("file:leaves.v.glsl","file:leaves.f.glsl","gl"),
    
    "image:hsl":                    new Loader.LdResourceImage("assets/textures/palettes/hsl.png"),
    "image:hsl_desaturated":        new Loader.LdResourceImage("assets/textures/palettes/hsl_desaturated.png"),
    "image:imphenzia":              new Loader.LdResourceImage("assets/textures/palettes/imphenzia.png"),
    "image:test":                   new Loader.LdResourceImage("assets/textures/test.png"),
    "3dRes:superbox":               new TexturedTrianglesResourceLoader("file:superbox_blue.obj","image:imphenzia","gl"),
    "3dRes:bricks":                 new TexturedTrianglesResourceLoader("file:bricks.obj","image:hsl_desaturated","gl"),
    "3dRes:player":                 new ShaderTrianglesResourceLoader("file:player.obj","shader:leaves","gl"),
    "3dRes:coin":                   new TexturedTrianglesResourceLoader("file:coin.obj","image:hsl","gl"),
    "3dRes:test":                   new TexturedTrianglesResourceLoader("file:cube_same_texture.obj","image:test","gl"),
    "3dRes:worldnode":              new ShadersTrianglesResourceLoader("file:worldnode.obj",SHADER_MATERIAL_IDS,"gl"),
    
    "3dRes:greenworld":             new ShadersTrianglesResourceLoader("file:greenworld.obj",SHADER_MATERIAL_IDS,"gl"),
    "3dRes:buildingTypeA":          new TexturedTrianglesResourceLoader("file:buildingTypeA.obj","image:imphenzia","gl"),

    "3dRes:demo_stone_box":         new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:stone","gl"),
    "3dRes:demo_sand_box":          new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:sand","gl"),
    "3dRes:demo_water_box":         new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:water","gl"),
    "3dRes:demo_magic_box":         new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:magic","gl"),
    "3dRes:demo_grass_box":         new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:grass","gl"),
    "3dRes:demo_leaves_box":        new ShaderTrianglesResourceLoader("file:cube_same_texture.obj","shader:leaves","gl"),

    
    "sound:hallo":                  new Loader.LdResourceAudioBuffer("assets/audio/music/A.mp3","actx")
};

