// I am a dumb reposetory test area
const SPEED = 0.05;
const R_SPEED = 0.2;
const RM_SPEED = 0.002;

const KEY_FWD = 87;
const KEY_LEFT = 65;
const KEY_BKWD = 83;
const KEY_RIGHT = 68;
const KEY_UP = 32;
const KEY_DOWN = 16;
const KEY_R_UP = 38;
const KEY_R_LEFT = 37;
const KEY_R_DOWN = 40;
const KEY_R_RIGHT = 39;
const KEY_ZOOM = 67;

console.log("Index.js is running...");
onload = async function() {
    let gl = threeDGraphics.initGL(document.getElementById("canv"));
    let world = new threeDGraphics.World(gl);
    let triangleRes = new threeDGraphics.TriangleTestRecource();
    let strucPos = new Float32Array(16);
    glMatrix.mat4.identity(strucPos);
    await triangleRes.init(gl);
    let struc = new threeDGraphics.SimpleStructure(triangleRes, strucPos);
    world.addStructure(struc);
    let cam = new Camera();
    function loop() {
        camCntrl(cam);
        world.setCamera(cam.updateMatrix());
        world.draw();
    }
    setInterval(loop, 100)
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
    }
    updateMatrix() {
        glMatrix.mat4.identity(this.matrix);
        glMatrix.mat4.translate(this.matrix,this.matrix, this.pos);
        glMatrix.mat4.rotateY(this.matrix,this.matrix, this.ang1);
        glMatrix.mat4.rotateX(this.matrix,this.matrix, this.ang2);
        glMatrix.mat4.rotateZ(this.matrix,this.matrix, this.ang3);
        glMatrix.mat4.invert(this.matrix, this.matrix)
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
        this.ang1 = (Math.PI2 + this.ang1)%(Math.PI2);
    }
    ctrlRot2(angle) {
        this.ang2 += angle;
        this.ang2 = Math.min(Math.PI/2,Math.max(-Math.PI/2,this.ang2));
    }
    ctrlRot3(angle) {
        this.ang3 += angle;
        this.ang3 = (Math.PI2 + this.ang3)%(Math.PI2);
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
}