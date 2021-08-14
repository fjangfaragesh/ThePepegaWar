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
    let gl = threeDGraphics.initGL(document.getElementById("canv"));
    glcanv = document.getElementById("canv");
    let world = new threeDGraphics.World(gl);
    
    let loader = new Loader.ResouceLoader();
    loader.add(new Loader.LdResourceText("../assets/models/basic_shapes/cube_same_texture.obj"),"file:cube_same_texture.obj");
    loader.add(new Loader.LdResourceText("../assets/models/items/coin.obj"),"file:coin.obj");
    loader.add(new Loader.LdResourceText("../assets/models/creatures/scary_ghost.obj"),"file:scary_ghost.obj");
    loader.add(new Loader.LdResourceText("../assets/models/boxes/superbox_blue.obj"),"file:superbox_blue.obj");
    loader.add(new Loader.LdResourceImage("../assets/textures/palettes/hsl.png"),"image:hsl");
    loader.add(new Loader.LdResourceImage("../assets/textures/palettes/imphenzia.png"),"image:imphenzia");
    loader.add(new Loader.LdResourceImage("../assets/textures/test.png"),"image:test");
    loader.add(new Loader.LdResourceImage("../assets/textures/wuhu.png"),"image:whuh");
    
    loader.add(new TexturedTrianglesResourceLoader("file:superbox_blue.obj","image:imphenzia"), "3dRes:superbox");
    loader.add(new TexturedTrianglesResourceLoader("file:coin.obj","image:hsl"), "3dRes:coin");
    loader.add(new TexturedTrianglesResourceLoader("file:cube_same_texture.obj","image:test"), "3dRes:test");
    loader.add(new TexturedTrianglesResourceLoader("file:scary_ghost.obj","image:whuh"), "3dRes:whuh");

    
    await loader.loadAll();
    
    
    await loader.getValue("3dRes:superbox").init(gl);
    await loader.getValue("3dRes:test").init(gl);
    await loader.getValue("3dRes:coin").init(gl);
    await loader.getValue("3dRes:whuh").init(gl);
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
    let box3 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:superbox"), new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
    let box4 = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:superbox"), new Float32Array([0.25,0,0,0, 0,4,0,0, 0,0,3,0, 0,0,0,1]));
    let bdrdbx = new threeDGraphics.SimpleStructure(loader.getValue("3dRes:test"), new Float32Array([20,0,0,0, 0,5,0,0, 0,0,20,0, 0,0,0,1]));
    world.addStructure(box1);
    world.addStructure(box2);
    world.addStructure(box3);
    world.addStructure(box4);
    world.addStructure(bdrdbx);

    let cam = new Camera();
    checkIfCanvasIsLocked(glcanv);
    onmousemove = function(e) {
        if(!canvLockState) { return }
        cam.ctrlRot1(-RM_SPEED*e.movementX*(isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
        cam.ctrlRot2(-RM_SPEED*e.movementY*(isKeyPressed(KEY_ZOOM) ? 0.1 : 1));
    }
    
    
    
    
    pworld = new Physics.World();
    b1 = new LoveCube("A",[0,0,0],[0,0,0],2,[1,1,1],false);
    b2 = new LoveCube("B",[-2,0,0],[0,0,0],1,[1,1,1],false);
    b3 = new LoveCube("C",[2,0,0],[0,0,0],8,[1,1,1],false);
    b4 = new LoveCube("D",[4,0,0],[0,0,0],50,[0.25,4,3],false);
    brdr = new LoveCube("Fussboden",[0,-5,0],[0,0,0],1000000,[20,5,20],true);
    pworld.bodys.push(b1);
    pworld.bodys.push(b2);
    pworld.bodys.push(b3);
    pworld.bodys.push(b4);
    pworld.bodys.push(brdr)
    pworld.calcPhasePairs();
    function loop() {
        if (isKeyPressed(KEY_ACTION_LEFT)) b1.velocity[0] = (b1.velocity[0] - 1)*0.95;
        if (isKeyPressed(KEY_ACTION_RIGHT)) b1.velocity[0] = (b1.velocity[0] + 1)*0.95;
        if (isKeyPressed(KEY_ACTION_DOWN)) b1.velocity[1] = (b1.velocity[1] - 1)*0.95;
        if (isKeyPressed(KEY_ACTION_UP)) b1.velocity[1] = (b1.velocity[1] + 1)*0.95;
        if (isKeyPressed(KEY_ACTION_FWD)) b1.velocity[2] = (b1.velocity[2] - 1)*0.95;
        if (isKeyPressed(KEY_ACTION_BKWD)) b1.velocity[2] = (b1.velocity[2] + 1)*0.95;
        if (isKeyPressed(KEY_ACTION_STOP)) b1.velocity = [0,0,0];



        
        pworld.tick(0.01);
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
        
        bdrdbx.getTransformation()[12] = brdr.position[0];
        bdrdbx.getTransformation()[13] = brdr.position[1];
        bdrdbx.getTransformation()[14] = brdr.position[2];
        // glMatrix.mat4.rotateY(coin.getTransformation(),coin.getTransformation(),0.0134);
        // glMatrix.mat4.rotateY(wuhu.getTransformation(),wuhu.getTransformation(),-0.0461);
        glcanv.width = window.innerWidth;
        glcanv.height = window.innerHeight;
        gl.viewport(0,0,window.innerWidth, innerHeight)
        cam.setWidthHightRatio(window.innerWidth/window.innerHeight);
        camCntrl(cam);
        world.setCamera(cam.updateMatrix());
        world.draw();
    }
    setInterval(loop, 10);
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

function camCntrl(cam) {
    if (isKeyPressed(KEY_FWD)) cam.ctrlMove(0,0,-SPEED);
    if (isKeyPressed(KEY_LEFT)) cam.ctrlMove(-SPEED,0,0);
    if (isKeyPressed(KEY_BKWD)) cam.ctrlMove(0,0,SPEED);
    if (isKeyPressed(KEY_RIGHT)) cam.ctrlMove(SPEED,0,0);
    if (isKeyPressed(KEY_UP)) cam.ctrlMove(0,SPEED,0);
    if (isKeyPressed(KEY_DOWN)) cam.ctrlMove(0,-SPEED,0);
    if (isKeyPressed(KEY_R_UP)) cam.ctrlRot2(-R_SPEED);
    if (isKeyPressed(KEY_R_LEFT)) cam.ctrlRot1(-R_SPEED);
    if (isKeyPressed(KEY_R_DOWN)) cam.ctrlRot2(R_SPEED);
    if (isKeyPressed(KEY_R_RIGHT)) cam.ctrlRot1(R_SPEED);
    cam.setFieldOfView( (isKeyPressed(KEY_ZOOM) ? 5/180*Math.PI : 60/180*Math.PI) )
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
    constructor(idObjFile,idImg) {
        super([idObjFile,idImg],"3dRes")
        this.idObjFile = idObjFile;
        this.idImg = idImg;
    }
    async loadFunction(dep) {
        return new threeDGraphics.TexturedTrianglesResource(
            ObjLoader.loadObjFromString(dep[this.idObjFile]).generateTriangles(),
            dep[this.idImg]
        );
    }
}



class LoveCube extends Physics.Body {
    constructor(id,position, velocity, mass, size, sink) {
        super(id,position, velocity, mass, sink);
        this.size = size;
        this.setHitPhases([
            new Physics.HitPhase(this,[-size[0]/2,0,0],Physics.HitPhase.AXIS.X,-Physics.HitPhase.DIRECTION.POSITIVE,[size[1],size[2]]),
            new Physics.HitPhase(this,[size[0]/2,0,0],Physics.HitPhase.AXIS.X,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[1],size[2]]),
            new Physics.HitPhase(this,[0,-size[1]/2,0],Physics.HitPhase.AXIS.Y,-Physics.HitPhase.DIRECTION.POSITIVE,[size[2],size[0]]),
            new Physics.HitPhase(this,[0,size[1]/2,0],Physics.HitPhase.AXIS.Y,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[2],size[0]]),
            new Physics.HitPhase(this,[0,0,-size[2]/2],Physics.HitPhase.AXIS.Z,-Physics.HitPhase.DIRECTION.POSITIVE,[size[0],size[1]]),
            new Physics.HitPhase(this,[0,0,size[2]/2],Physics.HitPhase.AXIS.Z,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[0],size[1]]),
        ]);
    }
}

class BorderCube extends Physics.Body {
    constructor(id,position, velocity, mass, size, sink) {
        super(id,position, velocity, mass, sink);
        this.size = size;
        this.setHitPhases([
            new Physics.HitPhase(this,[-size[0]/2,0,0],Physics.HitPhase.AXIS.X,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[1],size[2]]),
            new Physics.HitPhase(this,[size[0]/2,0,0],Physics.HitPhase.AXIS.X,-Physics.HitPhase.DIRECTION.POSITIVE,[size[1],size[2]]),
            new Physics.HitPhase(this,[0,-size[1]/2,0],Physics.HitPhase.AXIS.Y,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[2],size[0]]),
            new Physics.HitPhase(this,[0,size[1]/2,0],Physics.HitPhase.AXIS.Y,-Physics.HitPhase.DIRECTION.POSITIVE,[size[2],size[0]]),
            new Physics.HitPhase(this,[0,0,-size[2]/2],Physics.HitPhase.AXIS.Z,-Physics.HitPhase.DIRECTION.NEGATIVE,[size[0],size[1]]),
            new Physics.HitPhase(this,[0,0,size[2]/2],Physics.HitPhase.AXIS.Z,-Physics.HitPhase.DIRECTION.POSITIVE,[size[0],size[1]]),
        ]);
    }
}
