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
        this.triangles = [];
    }
    getV(id) {
        for (let x of this.points) {
            if (x.id == id) return x;
        }
        throw new Error("v " + id + " net gefunden :(");
    }
    getF(id) {
        for (let x of this.triangles) {
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
    
    generateTriangles() {
        let ret = [];
        for (let t of this.triangles) {
            let v1 = this.getV(t.p1);
            let v2 = this.getV(t.p2);
            let v3 = this.getV(t.p3);
            let n1 = this.getVN(t.n1);
            let n2 = this.getVN(t.n2);
            let n3 = this.getVN(t.n3);
            let t1 = this.getVT(t.t1);
            let t2 = this.getVT(t.t2);
            let t3 = this.getVT(t.t3);
            ret.push(
                {"p1":{"x":v1.x,"y":v1.y,"z":v1.z,"nx":n1.x,"ny":n1.y,"nz":n1.z,"tx":t1.x,"ty":t1.y},
                 "p2":{"x":v2.x,"y":v2.y,"z":v2.z,"nx":n2.x,"ny":n2.y,"nz":n2.z,"tx":t2.x,"ty":t2.y},
                 "p3":{"x":v3.x,"y":v3.y,"z":v3.z,"nx":n3.x,"ny":n3.y,"nz":n3.z,"tx":t3.x,"ty":t3.y}
                });
        }
        return ret;
    }
    generateTrianglesFromMaterial(materialName) {
        let ret = [];
        for (let t of this.triangles) {
            if (t.material != materialName) continue;
            let v1 = this.getV(t.p1);
            let v2 = this.getV(t.p2);
            let v3 = this.getV(t.p3);
            let n1 = this.getVN(t.n1);
            let n2 = this.getVN(t.n2);
            let n3 = this.getVN(t.n3);
            let t1 = this.getVT(t.t1);
            let t2 = this.getVT(t.t2);
            let t3 = this.getVT(t.t3);
            ret.push(
                {"p1":{"x":v1.x,"y":v1.y,"z":v1.z,"nx":n1.x,"ny":n1.y,"nz":n1.z,"tx":t1.x,"ty":t1.y},
                 "p2":{"x":v2.x,"y":v2.y,"z":v2.z,"nx":n2.x,"ny":n2.y,"nz":n2.z,"tx":t2.x,"ty":t2.y},
                 "p3":{"x":v3.x,"y":v3.y,"z":v3.z,"nx":n3.x,"ny":n3.y,"nz":n3.z,"tx":t3.x,"ty":t3.y}
                });
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


ObjLoader.Triangle = class {
    constructor(id, p1,p2,p3, n1,n2,n3, t1,t2,t3, s, material, group) {
        this.id = id;
        
        this.p1 = p1;//id of point1
        this.p2 = p2;//id of point2
        this.p3 = p3;//id of point3
        
        this.n1 = n1;//normale
        this.n2 = n2;//normale
        this.n3 = n3;//normale
        
        this.t1 = t1;//texture coordinate
        this.t2 = t2;//texture coordinate
        this.t3 = t3;//texture coordinate

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
                ret.triangles.push(ObjLoader._parseTriangle(wds,fId++,currentMat,currentGroup));
                break;
            case "default":
 //                 console.log("ignored: " + l);
        }
    }
    return ret;
}

ObjLoader._parseTriangle = function(wds,fId,currentMat,currentGroup) {
        let p1d = ObjLoader._parseTriangleVtx(wds[1].split("/"));
        let p2d = ObjLoader._parseTriangleVtx(wds[2].split("/"));
        let p3d = ObjLoader._parseTriangleVtx(wds[3].split("/"));
        
        return new ObjLoader.Triangle(fId++,  
                p1d.vertex,p2d.vertex,p3d.vertex, 
                p1d.normale,p2d.normale,p3d.normale, 
                p1d.texture,p2d.texture,p3d.texture,
                undefined /* TODO  */,currentMat,currentGroup);   
}
ObjLoader._parseTriangleVtx = function(pwds) {
        if (pwds.length == 3) return {"vertex":pwds[0], "texture":pwds[1] == "" ? undefined : pwds[1], "normale":pwds[2]};
        if (pwds.length == 2) return {"vertex":pwds[0], "texture":pwds[1], "normale":undefined};
        return {"vertex":pwds[0], "texture":pwds[0], "texture":undefined, "normale":undefined};
    }
