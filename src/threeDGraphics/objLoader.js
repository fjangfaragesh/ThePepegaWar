const ObjLoader = {};

ObjLoader.loadObjFile = async function(path) {
    let req = new XMLHttpRequest();
    req.open("GET", path, true);
    return new Promise(function(res,rej) {
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status == 200 || req.status == 0) {
                    res(ObjLoader.loadObjFromString(req.responseText));
                } else {
                    rej("Kann obj " + path + " net laden: " + req.status);
                }
            }
        }
        req.send(null);
    });
}

ObjLoader.Object = class {
    constructor() {
        this.materialLibs = [];
        this.texCoords = [];
        this.normales = [];
        this.points = [];
        this.faces = [];
    }
    getV(id) {
        for (let x of this.points) {
            if (x.id == id) return x;
        }
        console.log(this);
        throw new Error("v " + id + " net gefunden :(");
    }
    getF(id) {
        for (let x of this.faces) {
            if (x.id == id) return x;
        }
        throw new Error("f " + id + " net gefunden :(");
    }
    getVN(id) {
        for (let x of this.normales) {
            if (x.id == id) return x;
        }
        return ObjLoader.Normale.DEFAULT;
    }
    getVT(id) {
        for (let x of this.texCoords) {
            if (x.id == id) return x;
        }
        return ObjLoader.TextureCoord.DEFAULT;
    }
    
    
    generateTriangleFromId(fId) {
        return this.generatrTriangle(this.getF(fId));
    }
    generatrTriangle(f) {
        let v1 = this.getV(f.ps[0]);
        let v2 = this.getV(f.ps[1]);
        let v3 = this.getV(f.ps[2]);
        let n1 = this.getVN(f.ns[0]);
        let n2 = this.getVN(f.ns[1]);
        let n3 = this.getVN(f.ns[2]);
        let t1 = this.getVT(f.ts[0]);
        let t2 = this.getVT(f.ts[1]);
        let t3 = this.getVT(f.ts[2]);
        return {
                "p1":{"x":v1.x,"y":v1.y,"z":v1.z,"nx":n1.x,"ny":n1.y,"nz":n1.z,"tx":t1.x,"ty":t1.y},
                "p2":{"x":v2.x,"y":v2.y,"z":v2.z,"nx":n2.x,"ny":n2.y,"nz":n2.z,"tx":t2.x,"ty":t2.y},
                "p3":{"x":v3.x,"y":v3.y,"z":v3.z,"nx":n3.x,"ny":n3.y,"nz":n3.z,"tx":t3.x,"ty":t3.y}
        };
    }
    
    generateQuadrangleFromId(fId) {
        return this.generateQuadrangle(this.getF(fId));
    }
    generateQuadrangle()  {
        let v1 = this.getV(f.ps[0]);
        let v2 = this.getV(f.ps[1]);
        let v3 = this.getV(f.ps[2]);
        let v4 = this.getV(f.ps[3]);
        let n1 = this.getVN(f.ns[0]);
        let n2 = this.getVN(f.ns[1]);
        let n3 = this.getVN(f.ns[2]);
        let n4 = this.getVN(f.ns[3]);
        let t1 = this.getVT(f.ts[0]);
        let t2 = this.getVT(f.ts[1]);
        let t3 = this.getVT(f.ts[2]);
        let t4 = this.getVT(f.ts[3]);
        return {
                "p1":{"x":v1.x,"y":v1.y,"z":v1.z,"nx":n1.x,"ny":n1.y,"nz":n1.z,"tx":t1.x,"ty":t1.y},
                "p2":{"x":v2.x,"y":v2.y,"z":v2.z,"nx":n2.x,"ny":n2.y,"nz":n2.z,"tx":t2.x,"ty":t2.y},
                "p3":{"x":v3.x,"y":v3.y,"z":v3.z,"nx":n3.x,"ny":n3.y,"nz":n3.z,"tx":t3.x,"ty":t3.y},
                "p3":{"x":v4.x,"y":v4.y,"z":v4.z,"nx":n4.x,"ny":n4.y,"nz":n4.z,"tx":t4.x,"ty":t4.y}
        };
    }
    
    generateTriangles() {
        let ret = [];
        for (let f of this.faces) {
            ret.push(this.generatrTriangle(f));
        }
        return ret;
    }
    generateTrianglesFromMaterial(materialName) {
        let ret = [];
        for (let f of this.faces) {
            if (f.material != materialName) continue;
            ret.push(this.generatrTriangle(f));
        }
        return ret;
    }
}

ObjLoader.Point = class {
    constructor(id, x,y,z) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

ObjLoader.TextureCoord = class {
    constructor(id,x,y)   {
        this.id = id;
        this.x = x;
        this.y = y;
    }
    
}
ObjLoader.TextureCoord.DEFAULT = new ObjLoader.TextureCoord("",0,0);

ObjLoader.Normale = class {
    constructor(id,x,y,z) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
ObjLoader.Normale.DEFAULT = new ObjLoader.Normale("",0,0,0);


ObjLoader.Face = class {
    constructor(id, ps, ns, ts, s, material, group) {
        this.id = id;
        
        this.ps = ps;//ids of points
        this.ns = ns;//ids of normals
        this.ts = ts;//ids of texture coordinates
        
        this.s = s;// glättung (0: aus, sonst 1 bis 32)
        this.material = material;
        this.group = group;
    }
}



ObjLoader.loadObjFromString = function(objStr) {
    let ret = new ObjLoader.Object();
    let lines = objStr.split("\n");
    let pId = 1;
    let fId = 1;
    let tId = 1;
    let nId = 1;
    let currentMat = undefined;
    let currentGroup = undefined;
    let currentS = 0;
    for (let l of lines) {
        if (l == "" || l.startsWith("#")) continue;
        let wds = l.split(" ");
        switch (wds[0]) {
            case "mtllib":
                ret.materialLibs.push(wds[1]);
                break;
            case "usemtl":
                currentMat = wds[1];
                break;
            case "v":
                ret.points.push(new ObjLoader.Point(pId++,wds[1]*1,wds[2]*1,wds[3]*1, Math.random()/3,Math.random()/3,Math.random()/3));
                break;
            case "vt":
                ret.texCoords.push(new ObjLoader.TextureCoord(tId++, wds[1]*1, wds[2]*1));
                break;
            case "vn":
                ret.normales.push(new ObjLoader.Normale(nId++, wds[1]*1, wds[2]*1, wds[3]*1));
                break;
            case "g":
                currentGroup = wds[1];
                break;
            case "s":
                currentS = wds[1] == "off" ? 0 : wds[1]*1;
                break;
            case "f":
                ret.faces.push(ObjLoader._parseFace(wds,fId++,currentMat,currentGroup));
                break;
            case "default":
 //                 console.log("ignored: " + l);
        }
    }
    return ret;
}

ObjLoader._parseFace = function(wds,fId,currentMat,currentGroup) {
        let ps = [];
        let ns = [];
        let ts = [];
        
        let wds2 = wds.slice(1);
        for (let w of wds2) {
            let d = ObjLoader._parseVtx(w.split("/"));
            ps.push(d.vertex);
            ns.push(d.normale);
            ts.push(d.texture);
        }
        
        return new ObjLoader.Face(fId++, ps,ns,ts, undefined /* TODO  */,currentMat,currentGroup);   
}
ObjLoader._parseVtx = function(pwds) {
        if (pwds.length == 3) return {"vertex":pwds[0], "texture":pwds[1] == "" ? undefined : pwds[1], "normale":pwds[2]};
        if (pwds.length == 2) return {"vertex":pwds[0], "texture":pwds[1], "normale":undefined};
        return {"vertex":pwds[0], "texture":pwds[0], "texture":undefined, "normale":undefined};
    }
