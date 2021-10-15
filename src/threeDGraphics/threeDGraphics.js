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
        this.globalConfigurations = {"mView":new Float32Array(16)};
        glMatrix.mat4.identity(this.globalConfigurations.mView);
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

    setGlobalConfiguration(id, value) {
        this.globalConfigurations[id] = value;
    }
    
    setCamera(matr) {
        this.setGlobalConfiguration("mView",matr);
    }

    draw() {
        let gl = this.gl;
        gl.clearColor(0.5,0.6,0.9,1.0);// TODO als globalConfiguration
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
            glMatrix.mat4.multiply(newtrans, trans, transformation);
            trans=newtrans; 
        }

        let resources = struc.getRecources();
        for(let r of resources) {
            r.draw(trans, this.globalConfigurations);
        }
        let substruc = struc.getSubStructures();
        for(let ss of substruc) {
            this._drawStuc(ss, trans);
        }
    }
}

// interface threeDGraphics.Resource {
//     async init(gl);
//     draw(mObject, globalConfigurations);
// }
//


threeDGraphics.TexturedTrianglesResource = class {
    constructor(triangles,image) {
        //triangles : [{"p1":{x,y,z,tx,ty},"p2":...,"p3":...},...]
        this.triangles = triangles;
        this.image = image;
    };
    async init(gl) {
        this.gl = gl;
        this._createProgram();
        this._bufferData();
        this._positions();
        this._createTexture();
    }
    
    _createProgram() {
        let gl = this.gl;
        this._createVertexShader();
        this._createFragmentShader();
        
        this.programm = gl.createProgram()
        gl.attachShader(this.programm, this.vertexShader);
        gl.attachShader(this.programm, this.fragmentShader);
        gl.linkProgram(this.programm);
        if (!gl.getProgramParameter(this.programm,gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.programm));
            alert("linkungs fehler :(\n" + gl.getProgramInfoLog(this.programm));
            throw new Error("linkungs fehler :(");
        }
        
    }
    
    _createVertexShader() {
        let gl = this.gl;
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, threeDGraphics.TexturedTrianglesResource.VShaderCode);
        gl.compileShader(this.vertexShader);
        if (!gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.vertexShader));
            alert("vertexShader compilierungs fehler :(\n" + gl.getShaderInfoLog(this.vertexShader));
            throw new Error("vertexShader compilierungs fehler :(");
        }
    }
    _createFragmentShader() {
        let gl = this.gl;
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, threeDGraphics.TexturedTrianglesResource.FShaderCode);
        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.fragmentShader));
            alert("FragmentShader compilierungs fehler :(\n" + gl.getShaderInfoLog(this.fragmentShader));
            throw new Error("FragmentShader compilierungs fehler :(");
        }
    }
    _bufferData() {
        let gl = this.gl;
        this.triangleVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER ,this.triangleVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.alternative ? threeDGraphics.myTriangle2 : this._generateBufferArray(), gl.STATIC_DRAW);
    }
    _generateBufferArray() {
        console.log(this.triangles);
        let m = 8*3;
        let arr = new Float32Array(this.triangles.length*m);
        for (let i = 0; i < this.triangles.length; i++) {
            let t = this.triangles[i];
            arr[i*m + 0] = t.p1.x;
            arr[i*m + 1] = t.p1.y;
            arr[i*m + 2] = t.p1.z;
            arr[i*m + 3] = t.p1.tx;
            arr[i*m + 4] = t.p1.ty;
            arr[i*m + 5] = t.p1.nx;
            arr[i*m + 6] = t.p1.ny;
            arr[i*m + 7] = t.p1.nz;
            
            arr[i*m + 8] = t.p2.x;
            arr[i*m + 9] = t.p2.y;
            arr[i*m +10] = t.p2.z;
            arr[i*m +11] = t.p2.tx;
            arr[i*m +12] = t.p2.ty;
            arr[i*m +13] = t.p2.nx;
            arr[i*m +14] = t.p2.ny;
            arr[i*m +15] = t.p2.nz;
            
            arr[i*m +16] = t.p3.x;
            arr[i*m +17] = t.p3.y;
            arr[i*m +18] = t.p3.z;
            arr[i*m +19] = t.p3.tx;
            arr[i*m +20] = t.p3.ty;
            arr[i*m +21] = t.p3.nx;
            arr[i*m +22] = t.p3.ny;
            arr[i*m +23] = t.p3.nz;
        }
        //alert(arr);
        return arr;
    }
    _positions() {
        let gl = this.gl;
        this.posAttribLocation = gl.getAttribLocation(this.programm, "vertPosition");
        this.textCoordAttribLocation = gl.getAttribLocation(this.programm, "vertTexCoord");
        this.normaleAttribLocation = gl.getAttribLocation(this.programm, "vertNormale");
        this.mObjectUniformLocation = gl.getUniformLocation(this.programm, "mObject");
        this.mViewUniformLocation = gl.getUniformLocation(this.programm, "mView");
    }
    _createTexture() {
        let gl = this.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);//gl.LINEAR NEAREST ??
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    }
    
    draw(mObject, globalConfigurations) {
        let gl = this.gl;
        gl.useProgram(this.programm);
        gl.bindTexture(gl.TEXTURE_2D,this.texture);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.triangleVertexBuffer);
        
        //ah ja dad funkzioniert jeze :)
        gl.enableVertexAttribArray(this.posAttribLocation);
        gl.enableVertexAttribArray(this.textCoordAttribLocation);
        gl.enableVertexAttribArray(this.normaleAttribLocation);
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,0 );
        gl.vertexAttribPointer(this.textCoordAttribLocation, 2, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,3*Float32Array.BYTES_PER_ELEMENT );
        gl.vertexAttribPointer(this.normaleAttribLocation, 3, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,5*Float32Array.BYTES_PER_ELEMENT );

        
        gl.enable(gl.DEPTH_TEST);
        gl.uniformMatrix4fv(this.mObjectUniformLocation, gl.FALSE, mObject);
        gl.uniformMatrix4fv(this.mViewUniformLocation, gl.FALSE, globalConfigurations.mView);
        gl.drawArrays(gl.TRIANGLES, 0, this.triangles.length*3);
    }
}

threeDGraphics.TexturedTrianglesResource.VShaderCode = `
precision mediump float;\n
attribute vec3 vertPosition;\n
attribute vec2 vertTexCoord;\n
attribute vec3 vertNormale;\n
uniform mat4 mObject;\n
uniform mat4 mView;\n
varying vec2 fragTexCoord;\n
varying vec3 fragNormale;\n
void main() {\n
    fragTexCoord = vertTexCoord;\n
    fragNormale = normalize(vec3(mObject * vec4(vertNormale, 0.0)));\n
    fragTexCoord.y = 1.0 - fragTexCoord.y;\n
    gl_Position = mView * mObject * vec4(vertPosition, 1.0);\n 
}\n
`;  //proj * mview * mobject ...

//https://thebookofshaders.com/10/
threeDGraphics.TexturedTrianglesResource.FShaderCode = `
precision mediump float;\n
varying vec2 fragTexCoord;\n
varying vec3 fragNormale;\n
uniform sampler2D sampler;\n

void main() {\n
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));\n
    float ligthIntensity = max(0.0, dot(fragNormale,lightDirection))*0.8 + 0.2;\n
    vec4 texColor = texture2D(sampler, fragTexCoord);\n
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);\n
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);\n
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);\n
}\n
`;

threeDGraphics.createProgram = function(gl, vshaderCode, fshaderCode) {
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vshaderCode);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
            alert("vertexShader compilierungs fehler :(\n" + gl.getShaderInfoLog(vertexShader));
            throw new Error("vertexShader compilierungs fehler :(");
        }
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fshaderCode);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShader));
            alert("FragmentShader compilierungs fehler :(\n" + gl.getShaderInfoLog(fragmentShader));
            throw new Error("FragmentShader compilierungs fehler :(");
        }
        let programm = gl.createProgram()
        gl.attachShader(programm, vertexShader);
        gl.attachShader(programm, fragmentShader);
        gl.linkProgram(programm);
        if (!gl.getProgramParameter(programm,gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(programm));
            alert("linkungs fehler :(\n" + gl.getProgramInfoLog(programm));
            throw new Error("linkungs fehler :(");
        }
        return programm;
}


threeDGraphics.ShaderTrianglesResource = class {
    constructor(triangles, programm) {
        //triangles : [{"p1":{x,y,z,tx,ty},"p2":...,"p3":...},...]
        this.triangles = triangles;
        this.programm = programm;
        
        //this.vshaderCode = vshaderCode;
        //this.fshaderCode = fshaderCode;
    };
    async init(gl) {
        this.gl = gl;
        //this._createProgram();
        this._bufferData();
        this._positions();
    }
    _bufferData() {
        let gl = this.gl;
        this.triangleVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER ,this.triangleVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.alternative ? threeDGraphics.myTriangle2 : this._generateBufferArray(), gl.STATIC_DRAW);
    }
    _generateBufferArray() {
        console.log(this.triangles);
        let m = 8*3;
        let arr = new Float32Array(this.triangles.length*m);
        for (let i = 0; i < this.triangles.length; i++) {
            let t = this.triangles[i];
            arr[i*m + 0] = t.p1.x;
            arr[i*m + 1] = t.p1.y;
            arr[i*m + 2] = t.p1.z;
            arr[i*m + 3] = t.p1.tx;
            arr[i*m + 4] = t.p1.ty;
            arr[i*m + 5] = t.p1.nx;
            arr[i*m + 6] = t.p1.ny;
            arr[i*m + 7] = t.p1.nz;
            
            arr[i*m + 8] = t.p2.x;
            arr[i*m + 9] = t.p2.y;
            arr[i*m +10] = t.p2.z;
            arr[i*m +11] = t.p2.tx;
            arr[i*m +12] = t.p2.ty;
            arr[i*m +13] = t.p2.nx;
            arr[i*m +14] = t.p2.ny;
            arr[i*m +15] = t.p2.nz;
            
            arr[i*m +16] = t.p3.x;
            arr[i*m +17] = t.p3.y;
            arr[i*m +18] = t.p3.z;
            arr[i*m +19] = t.p3.tx;
            arr[i*m +20] = t.p3.ty;
            arr[i*m +21] = t.p3.nx;
            arr[i*m +22] = t.p3.ny;
            arr[i*m +23] = t.p3.nz;
        }
        //alert(arr);
        return arr;
    }
    _positions() {
        let gl = this.gl;
        this.posAttribLocation = gl.getAttribLocation(this.programm, "vertPosition");
        this.textCoordAttribLocation = gl.getAttribLocation(this.programm, "vertTexCoord");
        this.normaleAttribLocation = gl.getAttribLocation(this.programm, "vertNormale");
        this.mObjectUniformLocation = gl.getUniformLocation(this.programm, "mObject");
        this.mViewUniformLocation = gl.getUniformLocation(this.programm, "mView");
        this.timeUniformLocation = gl.getUniformLocation(this.programm, "time");
    }
    
    draw(mObject, globalConfigurations) {
        let gl = this.gl;
        gl.useProgram(this.programm);
        gl.bindBuffer(gl.ARRAY_BUFFER,this.triangleVertexBuffer);
        
        //ah ja dad funkzioniert jeze :)
        gl.enableVertexAttribArray(this.posAttribLocation);
        gl.enableVertexAttribArray(this.textCoordAttribLocation);
        gl.enableVertexAttribArray(this.normaleAttribLocation);
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,0 );
        gl.vertexAttribPointer(this.textCoordAttribLocation, 2, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,3*Float32Array.BYTES_PER_ELEMENT );
        gl.vertexAttribPointer(this.normaleAttribLocation, 3, gl.FLOAT, gl.FALSE, 8*Float32Array.BYTES_PER_ELEMENT,5*Float32Array.BYTES_PER_ELEMENT );

        
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.uniformMatrix4fv(this.mObjectUniformLocation, gl.FALSE, mObject);
        gl.uniformMatrix4fv(this.mViewUniformLocation, gl.FALSE, globalConfigurations.mView);
        
        gl.uniform1f(this.timeUniformLocation, globalConfigurations.time ?? 0.0);
        
        gl.drawArrays(gl.TRIANGLES, 0, this.triangles.length*3);
    }
}
threeDGraphics.ShadersTrianglesResource = class {
    constructor(shaderTrianglesResources) {
        this.shaderTrianglesResources = shaderTrianglesResources;
    }
    async init(gl) {
        for (let r of this.shaderTrianglesResources) await r.init(gl);
    }
    draw(mObject, globalConfigurations) {
        for (let r of this.shaderTrianglesResources) r.draw(mObject, globalConfigurations);
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
    
    setTransformation(trans) {
        this.trans = trans;
    }
    setResource(res) {
        this.res = res;
    }
} 
