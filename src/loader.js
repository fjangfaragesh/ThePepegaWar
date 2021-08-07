const Loader = {};

/* async */
Loader.loadImage = async function(src) {
    let ret = new Image();
    return new Promise(function (res,rejec) {
        ret.onload = function() {
            res(ret);
        };
        ret.src = src;
        ret.onerror = function(e) {
            rejec(e);
        }
    });
}
Loader.loadText = async function(path) {
    let req = new XMLHttpRequest();
    req.open("GET", path, true);
    return new Promise(function(res,rej) {
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status == 200 || req.status == 0) {
                    res(req.responseText);
                } else {
                    rej("Kann " + path + " net laden: " + req.status);
                }
            }
        }
        req.send(null);
    });
}


Loader.STATES = {"UNKNOWN_RESOURCE":-1,"WAITING":0,"LOADING":1,"READY":2,"ERROR":3};

Loader.ResouceLoader = class {
    constructor() {
        this.resources = {};
        this.waitingPromiseResRejFunctions = {};//{"res-id.....":[[res1,rej1],[res2,rej2],...],"res-id...":undefined}
    }
    add(res,id) {
        if (this.resources[id] !== undefined) throw new Error("resouce with id " + id + " already exist!");
        this.resources[id] = res;
    }
    get(id) {
        return this.resources[id];
    }
    getState(id) {
        if (this.resources[id] === undefined) return Loader.STATES.UNKNOWN_RESOURCE;
        return this.resources[id].getState();
    }
    getValue(id) {
        if (this.resources[id] === undefined) throw new Error("resouce with id " + id + " does not exist!");
        if (this.resources[id].getState() !== Loader.STATES.READY) throw new Error("resouce with id " + id + " is not ready!");
        return this.resources[id].getValue();
    }
    async waitFor(id) {
        if (this.getState(id) === Loader.STATES.READY) return;
        await new Promise((res,rej)=>{
            if (this.waitingPromiseResRejFunctions[id] === undefined) this.waitingPromiseResRejFunctions[id] = [];
            this.waitingPromiseResRejFunctions[id].push([res,rej]);
        });
    }
    
    async load(id) {
        let r = this.resources[id];
        let depArr = r.getDependencies();
        let dep = {};
        for (let d of depArr) {
            await this.waitFor(d);
            dep[d] = this.getValue(d);
        }
        if (await r.load(dep)) {
            if (this.waitingPromiseResRejFunctions[id] !== undefined) {
                for (let resRej of this.waitingPromiseResRejFunctions[id]) resRej[0]();
            }
        } else {
            if (this.waitingPromiseResRejFunctions[id] !== undefined) {
                for (let resRej of this.waitingPromiseResRejFunctions[id]) resRej[1](r.getValue());
            }
        }
        this.waitingPromiseResRejFunctions[id] = undefined;
    }
    
    async loadAll() {
        let kys = Object.keys(this.resources);
        for (let k of kys) {
            setTimeout(async ()=>this.load(k),0);
        }
        for (let k of kys) await this.waitFor(k);
    }
}

Loader.LdResource = class {
    constructor(dependencies,type) {
        this.dependencies = dependencies;
        this.state = Loader.STATES.WAITING;
        this.value = undefined;
        this.type = type;
    }
    getDependencies() {
        return this.dependencies;
    }
    getValue() {
        return this.value;
    }
    getType() {
        return this.type;
    }
    getState() {
        return this.state;
    }
    async load(dependencieValues) {
        this.state = Loader.STATES.LOADING;
        try {
            this.value = await this.loadFunction(dependencieValues);
            this.state = Loader.STATES.READY;
            return true;
        } catch (e) {
            this.value = e;
            this.state = Loader.STATES.ERROR;
            return false;
        }
    }
    async loadFunction(dependencieValues) {
        throw new Error("Loader.LdResource.loadFunction(...) is abstract!");
    }
}

Loader.LdResourceLoadFunction = class extends Loader.LdResource {
    //async loadFunction: exeption: error; returns loaded value
    constructor(dependencies,loadFunction,type) {
        super(dependencies,type);
        this.loadFunction = loadFunction;
    }
}

Loader.LdResourceImage = class extends Loader.LdResource {
    constructor(src,  type) {
        super([],type ?? Loader.LdResourceImage.DEFAULT_TYPE)
        this.src = src;
    }
    async loadFunction() {
        return await Loader.loadImage(this.src);
    }
}
Loader.LdResourceImage.DEFAULT_TYPE = "Image";


Loader.LdResourceText = class extends Loader.LdResource {
    constructor(src,  type) {
        super([],type ?? Loader.LdResourceText.DEFAULT_TYPE)
        this.src = src;
    }
    async loadFunction() {
        return await Loader.loadText(this.src);
    }
}
Loader.LdResourceText.DEFAULT_TYPE = "Text";
