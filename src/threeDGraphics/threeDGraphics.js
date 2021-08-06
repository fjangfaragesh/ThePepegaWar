const threeDGraphics = {};
threeDGraphics.initGL = function(canv) {
    let gl = canv.getContext("webgl");
    if(!gl) {
        gl = canv.getContext("experimental-webgl");
        if(!gl) {
            console.log("Web-GL is not supported!");
            throw new Error("Web-GL is not supported!");
        }
    }
    console.log("Web-Gl is supported");
    return gl
}

threeDGraphics.World = class{
    constructor(gl){
        this.gl = gl;
        this.structures = [];
        this.viewTransformation = new Float32Array(16);
        glMatrix.mat4.identity(this.viewTransformation);
    }
    addStructure(struc) {
        if(this.structures.indexOf(struc) != -1) return;
        this.structures.push(struc);
    }

    removeStructure(struc) {
        let index = this.structures.indexOf(struc)
        if(index != -1) {
            //I have found that its inside
            this.structures.splice(index, 1)
        }
    }

    setCamera(matr) {
        this.viewTransformation = matr;
    }

    draw() {
        let gl = this.gl;
        gl.clearColor(0.5,0.6,0.9,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        let einheitsmatrix = new Float32Array(16);
        glMatrix.mat4.identity(einheitsmatrix);
        for(let s of this.structures){
            this._drawStuc(s, einheitsmatrix);
        }
    }

    _drawStuc(struc, trans) {
        if(!struc.isVisible()){ return }
        let transformation = struc.getTransformation();  
        if(transformation != undefined) {
            let newtrans = new Float32Array(16);
            glMatrix.mat4.translate(newtrans, trans, transformation);
            trans=newtrans; 
        }
        let resources = struc.getRecources();
        for(let r of resources) {
            r.draw(trans, this.viewTransformation);
        }

        let substruc = struc.getSubStructures();
        for(let ss of substruc) {
            this._drawStuc(ss, trans);
        }
    }
}

threeDGraphics.TriangleTestRecource = class{
    constructor(texture, alt) {
        this.image = texture;
        this.alternative = alt;
    };
    async init(gl) {
        this.gl = gl;
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, threeDGraphics.TriangleTestRecource.VShaderCode);
        gl.compileShader(this.vertexShader);
        if (!gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) {
            alert("vertexShader compilierungs fehler :(");
            console.error(gl.getShaderInfoLog(this.vertexShader));
            throw new Error("vertexShader compilierungs fehler :(");
        }
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, threeDGraphics.TriangleTestRecource.FragShader);
        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) {
            alert("FragmentShader compilierungs fehler :(");
            console.error(gl.getShaderInfoLog(this.fragmentShader));
            throw new Error("FragmentShader compilierungs fehler :(");
        }
        this.programm = gl.createProgram()
        gl.attachShader(this.programm, this.vertexShader);
        gl.attachShader(this.programm, this.fragmentShader);
        gl.linkProgram(this.programm);
        if (!gl.getProgramParameter(this.programm,gl.LINK_STATUS)) {
            alert("linkungs fehler :(");
            console.error(gl.getProgramInfoLog(this.programm));
            throw new Error("linkungs fehler :(");
        }
        this.triangleVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER ,this.triangleVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.alternative ? threeDGraphics.myTriangle2 : threeDGraphics.myTriangle, gl.STATIC_DRAW);
        this.posAttribLocation = gl.getAttribLocation(this.programm, "vertPosition");
        this.textCoordLocation = gl.getAttribLocation(this.programm, "vertTexCoord");
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 5*Float32Array.BYTES_PER_ELEMENT,0 );
        gl.vertexAttribPointer(this.textCoordLocation, 2, gl.FLOAT, gl.FALSE, 5*Float32Array.BYTES_PER_ELEMENT,3*Float32Array.BYTES_PER_ELEMENT );
        gl.enableVertexAttribArray(this.posAttribLocation);
        gl.enableVertexAttribArray(this.textCoordLocation);
        this.mObjectUniformLocation = gl.getUniformLocation(this.programm, "mObject");
        this.mViewUniformLocation = gl.getUniformLocation(this.programm, "mView");

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

    }
    draw(mObject, mView) {
        let gl = this.gl;
        gl.useProgram(this.programm);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.triangleVertexBuffer)
        gl.enable(gl.DEPTH_TEST);
        gl.uniformMatrix4fv(this.mObjectUniformLocation, gl.FALSE, mObject);
        gl.uniformMatrix4fv(this.mViewUniformLocation, gl.FALSE, mView);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

threeDGraphics.SimpleStructure = class {
    constructor(res, trans) {
        this.res = res;
        this.trans = trans;
    }
    isVisible() {return true}
    getSubStructures() {return [] }
    getRecources() {return [this.res] }
    getTransformation() {return this.trans}
} 

threeDGraphics.TriangleTestRecource.VShaderCode = `
precision mediump float;\n
attribute vec3 vertPosition;\n
attribute vec2 vertTexCoord;\n
uniform mat4 mObject;\n
uniform mat4 mView;\n
varying vec2 fragTexCoord;\n
void main() {\n
    fragTexCoord = vertTexCoord;\n
    fragTexCoord.y = 1.0 - fragTexCoord.y;\n
    gl_Position = mView * mObject * vec4(vertPosition, 1.0);\n 
}\n
`;  //proj * mview * mobject ...

threeDGraphics.TriangleTestRecource.FragShader = `
precision mediump float;\n
varying vec2 fragTexCoord;\n
uniform sampler2D sampler;\n
void main() {\n
    gl_FragColor = texture2D(sampler, fragTexCoord);\n
}\n
`;

threeDGraphics.myTriangle = new Float32Array([
    0,0,0, 0,0,
    1,0,0, 1,0,
    0,1,0, 0,1
]);

threeDGraphics.myTriangle2 = new Float32Array([
    1,0,0, 0,0,
    0,0,0, 1,0,
    0,1,1, 0,1
]);