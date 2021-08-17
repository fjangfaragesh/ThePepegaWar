const Physics = {};

Physics.World = class {
    constructor(collisionManager,coefficientsManager) {
        this.bodys = [];
        
        this.collisionManager = collisionManager ?? new Physics.DefaultCollisionManager();// dieses ding wird gefragt, ob sich zwei flächen verschiedener Körper stoßen
        this.coefficientsManager = coefficientsManager ?? new Physics.DefaultCoefficientsManager(); // dieses Ding wird nach elastizitätskoeffizient und gleitreibungskoeffizient zweier flächen gefragt
        
        this.globalTime = 0;
        this.ticks = 0;
        
        this.gravity = [0.0,-9.81,0.0];
        
        this.phasePairs = undefined;
    }
    calcPhasePairs() {
        if (this.phasePairs !== undefined) for (let hitPhasePair of this.phasePairs) hitPhasePair.unTouch();
    
        this.phasePairs = [];
        for (let ib1 = 0; ib1 < this.bodys.length; ib1++) for (let ib2 = 0; ib2 < ib1; ib2++) {
            let b1 = this.bodys[ib1];
            let b2 = this.bodys[ib2];
            if (!this.collisionManager.canTheyCollide(b1.id,b2.id)) continue;        
            let hps1 = b1.getHitPhases();
            let hps2 = b2.getHitPhases();
            for (let hp1 of hps1) for (let hp2 of hps2) {
                if (hp1.normaleAxis !== hp2.normaleAxis) continue;
                if (hp1.direction === hp2.direction) continue;
                if (!this.collisionManager.canTheyCollide(b1.id,b2.id, hp1.id,hp2.id)) continue;    
                this.phasePairs.push(new Physics.PhasePair(hp1,hp2));
            }
        }
    }
    
    
    tick(dt) {
        //console.log("TICK");
        let t = 0;
        let n = 0;
        
        
        for (let b of this.bodys) b.prepareForNextTick();
        
        for (let hitPhasePair of this.phasePairs) hitPhasePair.prepareForNextTick();
        
        for (let hitPhasePair of this.phasePairs) hitPhasePair.calcTime(t);
        
        while (true) {
            //alert();
            
            //suchen nach dem Flächenpaar, welches als nächstes stößt  TODO: insert sort, ...
            let minT = Infinity;
            let minTPair = undefined;
            for (let hitPhasePair of this.phasePairs) {
                if (hitPhasePair.time < minT) {
                    minTPair = hitPhasePair;
                    minT = hitPhasePair.time;
                }
            }
 //           console.log("minT" + n, minT, "global",this.globalTime + minT);
            if (minT > dt) break;
            if (!minTPair.checkShock()) continue;
            t = minT;
            
            let changedBodyIds = [];
            //console.log("t= " + t + " SHOCK: " + minTPair.phaseA.body.id + " " + minTPair.phaseB.body.id + " (global:" + this.globalTime + ")");
            minTPair.shock(t,changedBodyIds);
 //           console.log("Bodys Changed:", changedBodyIds);
//            debugger;
            
            for (let hitPhasePair of this.phasePairs) {
                if (hitPhasePair.phaseA.normaleAxis !== minTPair.phaseA.normaleAxis) continue;
                if (changedBodyIds.indexOf(hitPhasePair.phaseA.body.id) !== -1 || changedBodyIds.indexOf(hitPhasePair.phaseB.body.id) !== -1) {
                    hitPhasePair.calcTime(t);
                }
            }
            n++;
        }
        // da kein stoß mehr auftritt können alle Körper an ihre Endposition bewegt werden
        for (let b of this.bodys) {
            b.position[0] += b.velocity[0]*(dt - b.timeOffset[0]);
            b.position[1] += b.velocity[1]*(dt - b.timeOffset[1]);
            b.position[2] += b.velocity[2]*(dt - b.timeOffset[2]);
        }
        this.globalTime += dt;
        
        
        for (let b of this.bodys) {
            b.applyPulse([b.mass*this.gravity[0]*dt, b.mass*this.gravity[1]*dt, b.mass*this.gravity[2]*dt]);
        }
        
        for (let hitPhasePair of this.phasePairs) {
            hitPhasePair.elastic(this.coefficientsManager);
            hitPhasePair.friction(this.coefficientsManager);// hier spielt die berechnungs reihenfolge ne rolle, aber vielleicht gehts ja trotzdem relativ gut...
        }
        this.ticks++;
        
    }
    
}

Physics.Body = class {
    constructor(id,position, velocity, mass, sink=false) {
        this.id = id;
        this.position = position; //array [x,y,z]
        this.velocity = velocity; //array [x,y,z]
        
        this.mass = mass;
        this.sink = sink;// ob dieses Teil keine beschleunigung erlaubt (masse sollte groß, aber nicht zu groß sein)
        this.sinkVelocity = velocity.slice();// auf diesen Wert wird die Geschwindigkeit immer gesetzt
        
        this.hitPhases = undefined;
        
        this.timeOffset = [0.0,0.0,0.0];
                
        this.touching = {
            xP: [],// TouchingHitPhaseGraphEdges, die in positive x richtung anliegen
            xN: [],
            yP: [],
            yN: [],
            zP: [],
            zN: []
        }
    }
    prepareForNextTick() {
        this.timeOffset[0] = 0.0;
        this.timeOffset[1] = 0.0;
        this.timeOffset[2] = 0.0;
    }
    
    
    setHitPhases(phases) {
        this.hitPhases = phases;
    }
    
    getHitPhases() {
        return this.hitPhases;
    }
    getTouchings(normaleAxis, direction) {
        if (normaleAxis === Physics.HitPhase.AXIS.X && direction === Physics.HitPhase.DIRECTION.POSITIVE) return this.touching.xP;
        if (normaleAxis === Physics.HitPhase.AXIS.X && direction === Physics.HitPhase.DIRECTION.NEGATIVE) return this.touching.xN;
        if (normaleAxis === Physics.HitPhase.AXIS.Y && direction === Physics.HitPhase.DIRECTION.POSITIVE) return this.touching.yP;
        if (normaleAxis === Physics.HitPhase.AXIS.Y && direction === Physics.HitPhase.DIRECTION.NEGATIVE) return this.touching.yN;
        if (normaleAxis === Physics.HitPhase.AXIS.Z && direction === Physics.HitPhase.DIRECTION.POSITIVE) return this.touching.zP;
        if (normaleAxis === Physics.HitPhase.AXIS.Z && direction === Physics.HitPhase.DIRECTION.NEGATIVE) return this.touching.zN;
        throw new Error("irgendwas stimmt hier net!");
    }
    
    //hitPhase undefined
    walkThroughTouchings(normaleAxis, direction, f,        hitPhasePairSource) {
        let tch = this.getTouchings(normaleAxis, direction);
        let rets = new Array(tch.length);
        for (let i = 0; i < tch.length; i++) {
            rets[i] = tch[i].nextBody.walkThroughTouchings(normaleAxis, direction, f, tch[i].hitPhasePair);
        }
        return f(this,rets,hitPhasePairSource);
    }
    isTouchingRecursive(normaleAxis, direction, bodyId) {
        if (this.id === bodyId) return true;
        let tch = this.getTouchings(normaleAxis, direction);
        for (let tc of tch) if (tc.nextBody.isTouchingRecursive(normaleAxis, direction, bodyId)) return true;
        return false;
    }
    
    
    // apply force over one tick, p = [px,py,pz]
    applyPulse(p) {
        if (this.sink) return;
        this.velocity[0] += p[0]/this.mass;
        this.velocity[1] += p[1]/this.mass;
        this.velocity[2] += p[2]/this.mass;
    }
    
}

Physics.HitPhase = class {
    constructor(id ,body,centerPos,normaleAxis,direction,size) {
        this.id = id;// jede Oberfläche (auch von verschiedenen Körpern) braucht eine eigene Id!
        this.body = body;
        this.centerPos = centerPos;
        this.normaleAxis = normaleAxis;
        this.direction = direction;
        this.size = size;//[u,v]    wenn normaleAxis=x: u=y, v=z; normaleAxis=y: u=z, v=x; normaleAxis=z: u=x, v=y;
        
        this.compressionPulse = 0.0;
    }
}
Physics.HitPhase.AXIS = {"X":0,"Y":1,"Z":2};
Physics.HitPhase.DIRECTION = {"POSITIVE":1,"NEGATIVE":-1};


Physics.PhasePair = class {
    constructor(phase1, phase2) {
        this.phaseA = phase1.direction === Physics.HitPhase.DIRECTION.POSITIVE ? phase1 : phase2;// direction positiv
        this.phaseB = phase1.direction === Physics.HitPhase.DIRECTION.POSITIVE ? phase2 : phase1;// direction negativ
        this.disabled = false;
        
        this.compressionPulse = 0.0; // der von den (temporär inelastischen) Stößen übertragene Impuls
        this.isTouching = false;// ob Körper A und B die selbe geschwindigkeit haben, und die phasen aufeinander liegen
        
        this.time = undefined;// wann die beiden colinear sein werden (ebenen aufeinander liegen), falls sie sich aufeinander zu bewegen. Hier wird nicht beachtet, dass sie in den anderen Achsen aneinander vorbei fliegen, das muss seperat betrachtete werden
    }
    addCompressionPulse(p) {
        this.phaseA.compressionPulse += p;
        this.phaseB.compressionPulse += p;
        this.compressionPulse += p;
    }
    
    
    calcTime(currentT) {
        let ax = this.phaseA.normaleAxis;
        
        let vA = this.phaseA.body.velocity[ax];
        let vB = this.phaseB.body.velocity[ax];
        
        if (vA == vB) {
            this.time = Infinity;// selbe geschwindigkeit: flächen werden NIE zusammen stoßen!
            return;
        }
        if (vA - vB < 0) {
            this.time = Infinity;// falsches vorzeichen: flächen sollen auch net stoße
            return;
        }
        let xA = this.phaseA.body.position[ax] + this.phaseA.centerPos[ax];
        let xB = this.phaseB.body.position[ax] + this.phaseB.centerPos[ax];;
        
        let tOffsetA = this.phaseA.body.timeOffset[ax];
        let tOffsetB = this.phaseB.body.timeOffset[ax];
        
        let xA0 = xA - vA*tOffsetA;
        let xB0 = xB - vB*tOffsetB;
        let t = (xB0 - xA0)/(vA - vB);
        if (xB0 - xA0 < 0.001 && xB0 - xA0 > -0.01) {
            this.time = currentT;
            return;
        }
        if (t >= currentT) {
            this.time = t;
            return;
        }
        this.time = Infinity;
    }
    
    // schaut ob fächen sich zur voher berechneten Zeit wirklich stoßen (ob sie aneinander vorbei fliegen oder sich treffen).  falls nein, wir die Zeit noch auf Infinity gesetzzt
    checkShock() {
        let t = this.time;
        
        let ax = this.phaseA.normaleAxis;
        let axU = (ax+1)%3;
        let axV = (ax+2)%3;
        
        let b1 = this.phaseA.body;
        let b2 = this.phaseB.body;
        
        let deltaU = b1.position[axU] + b1.velocity[axU]*(t-b1.timeOffset[axU]) - b2.position[axU] - b2.velocity[axU]*(t-b2.timeOffset[axU]);
        if (Math.abs(deltaU) >= (this.phaseA.size[0] + this.phaseB.size[0])/2) {
            this.time = Infinity;
            return false; // kein Stoß, weil flächen aneinander vorbei fliegen
        }
        let deltaV = b1.position[axV] + b1.velocity[axV]*(t-b1.timeOffset[axV]) - b2.position[axV] - b2.velocity[axV]*(t-b2.timeOffset[axV]);
        if (Math.abs(deltaV) >= (this.phaseA.size[1] + this.phaseB.size[1])/2) {
            this.time = Infinity;
            return false; // kein Stoß, weil flächen aneinander vorbei fliegen
        }
        return true;
    }
    
    //führt den Stoß duch (voher sollte noch checkShock() ausgeführt werden)
    shock(currentTime, changedBodyIds) {
        
        // nur zum debuggen
//        let idA = this.phaseA.id;
//        let idB = this.phaseB.id;
        
        
        let current = this;
        let ax = this.phaseA.normaleAxis;
        
        // berechnen der Gesammtmasse
        
        let numberOfSinks = 0;
        let sink = undefined;// es darf nur eine geben
        
        let mA = this.phaseA.body.walkThroughTouchings(this.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE, function(body, masses) {
                let m = body.mass;
                if (body.sink) {
                    sink = body;
                    numberOfSinks++;
                }
                for (let ms of masses) m += ms;
                return m;
        },this);
        let mB = this.phaseB.body.walkThroughTouchings(this.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE, function(body, masses) {
                let m = body.mass;
                if (body.sink) {
                    sink = body;
                    numberOfSinks++;
                }
                for (let ms of masses) m += ms;
                return m;
        },this);
        
        // berechnen der Endgeschwindigkeit des Verbandes
        let v;// neue geschwindigkeit

        let vA = this.phaseA.body.velocity[ax];// alte geschwindigkeit
        let vB = this.phaseB.body.velocity[ax];// alte geschwindigkeit
        
        v = (mA*vA + mB*vB)/(mA + mB);
        
        // falls es eine sink gibt, wird die geschwindigkeit des Gesammtverbands mit der von dieser überschrieben, es wird aber vorher trotzdem mit v gerechnet
        let vFinal = v;
        if (sink !== undefined) vFinal = sink.sinkVelocity[ax];
        

        
        
        let deltaV = vB - vA;// geschwindigkeitsunterschied (alt) der beiden körper
        
        let deltaVA = v - vA;// geschwindigkeitsänderung von körper A
        let deltaVB = v - vB;// geschwindigkeitsänderung von körper B
        
        // sich selbst zum Verband hinzu fügen TODO außer, wenn das schon irgendwie anders drin ist, zyklen erkennen
        this.touch();
        
        // berechnen der Belastungen, übertragen der Geschwindigkeit auf alle beteiligten Körper
        this.phaseA.body.walkThroughTouchings(this.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE, function(body, pulses, pair) {
                let p = -body.mass*deltaVA;// weil wenn Masse unendlich und deltaVA 0.0, dann wird NaN draus TODO
                for (let ps of pulses) p += ps;
                pair.addCompressionPulse(p); // fläche belasten
                body.position[ax] += body.velocity[ax]*(currentTime - body.timeOffset[ax]);
                //console.log(body.id + " moved by " + body.velocity[ax]*(currentTime - body.timeOffset[ax]));
                body.velocity[ax] = vFinal;
                //console.log(body.id + " vel=" + v);
                body.timeOffset[ax] = currentTime;
                changedBodyIds.push(body.id);
                return p;
        },this);
        this.phaseB.body.walkThroughTouchings(this.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE, function(body, pulses, pair) {
                let p = body.mass*deltaVB;// weil wenn Masse unendlich und deltaVA 0.0, dann wird NaN draus TODO
                for (let ps of pulses) p += ps;
                pair.addCompressionPulse(p); // fläche belasten
                body.position[ax] += body.velocity[ax]*(currentTime - body.timeOffset[ax]);
                //console.log(body.id + " moved by " + body.velocity[ax]*(currentTime - body.timeOffset[ax]));
                body.velocity[ax] = vFinal;
                //console.log(body.id + " vel=" + v);
                body.timeOffset[ax] = currentTime;
                changedBodyIds.push(body.id);
                return p;
        },this);
        
        // "gezogene" aus Verband entfernen
        this.phaseA.body.walkThroughTouchings(this.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE, function(body, pulses, pair) {
             let inversePhasePairGraphEdges = body.getTouchings(current.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE).slice();
             for (let ppge of inversePhasePairGraphEdges) if(ppge.hitPhasePair !== pair) ppge.hitPhasePair.unTouchIfNecessary();
        },this);
        this.phaseB.body.walkThroughTouchings(this.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE, function(body, pulses, pair) {
             let inversePhasePairGraphEdges = body.getTouchings(current.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE).slice();
             for (let ppge of inversePhasePairGraphEdges) if(ppge.hitPhasePair !== pair) ppge.hitPhasePair.unTouchIfNecessary();
        },this);
        
        
 //       debugger;
    }
    
    touch() {
//        debugger;
        if (this.isTouching) return;
 //       console.log(this.phaseA.body.id + " and " + this.phaseB.body.id + " now touching!");
        this.isTouching = true;
        this.phaseA.body.getTouchings(this.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE).push(new Physics.TouchingHitPhaseGraphEdge(this.phaseB.body,this));
        this.phaseB.body.getTouchings(this.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE).push(new Physics.TouchingHitPhaseGraphEdge(this.phaseA.body,this));
    }
    unTouch() {
//        debugger;
        if (!this.isTouching) return;
//        console.log(this.phaseA.body.id + " and " + this.phaseB.body.id + " now not touching!");
        this.isTouching = false;
        let tchA = this.phaseA.body.getTouchings(this.phaseA.normaleAxis, Physics.HitPhase.DIRECTION.POSITIVE);
        let indexA = tchA.findIndex((el)=>el.hitPhasePair === this);
        if (indexA !== -1) tchA.splice(indexA,1);
        let tchB = this.phaseB.body.getTouchings(this.phaseB.normaleAxis, Physics.HitPhase.DIRECTION.NEGATIVE);
        let indexB = tchB.findIndex((el)=>el.hitPhasePair === this);
        if (indexB !== -1) tchB.splice(indexB,1);
    }
    unTouchIfNecessary() {
        let ax = this.phaseA.normaleAxis;
        if (this.isTouching && this.phaseA.body.velocity[ax] !== this.phaseB.body.velocity[ax]) this.unTouch();
    }
    prepareForNextTick() {
        this.compressionPulse = 0.0;
        
        this.unTouchIfNecessary();
    }
    
    
    elastic(coefficientsManager) {
        if (this.compressionPulse === 0.0) return;

        let k = coefficientsManager.getK(this.phaseA.body.id, this.phaseB.body.id, this.phaseA.id, this.phaseB.id);
        
        let ax = this.phaseA.normaleAxis;
        let pA = [0,0,0];
        pA[ax] = -this.compressionPulse*k/2.0;
        this.phaseA.body.applyPulse(pA);
        let pB = [0,0,0];
        pB[ax] = this.compressionPulse*k/2.0;
        this.phaseB.body.applyPulse(pB);
    }
    friction(coefficientsManager) {
        if (this.compressionPulse === 0.0) return;
        let my = coefficientsManager.getMy(this.phaseA.body.id, this.phaseB.body.id, this.phaseA.id, this.phaseB.id);
        
        let ax = this.phaseA.normaleAxis;
        let axU = (ax+1)%3;
        let axV = (ax+2)%3;
        
        let b1 = this.phaseA.body;
        let b2 = this.phaseB.body;
        
        let v_u_rel = b2.velocity[axU] - b1.velocity[axU];
        let v_v_rel = b2.velocity[axV] - b1.velocity[axV];
        let v_rel = Math.sqrt(v_u_rel*v_u_rel + v_v_rel*v_v_rel);
        let v_u_rel0 = 0;
        let v_v_rel0 = 0;
        if (v_rel > 0.0000000001) {
            v_u_rel0 = v_u_rel/v_rel;
            v_v_rel0 = v_v_rel/v_rel;
        }//sonst einheitsvektor bildung net so möglich, wenn extrem langsam, dann halt keine Reibung
        let deltaV1_norm = this.compressionPulse/b1.mass;//betrag der geschwindigkeitsänderung auf der Stoßrichtung
        let deltaV2_norm = this.compressionPulse/b2.mass;
        
        let deltaV1 = Math.min(deltaV1_norm*my,v_rel);//betrag der geschwindigkeitsänderung duch reibung auf der zum Stoß senkrechten ebene
        let deltaV2 = Math.min(deltaV2_norm*my,v_rel);//betrag der geschwindigkeitsänderung duch reibung auf der zum Stoß senkrechten ebene
        
        let frPulse1 = [0,0,0];
        let frPulse2 = [0,0,0];

        frPulse1[axU] = deltaV1*v_u_rel0*b1.mass;
        frPulse1[axV] = deltaV1*v_v_rel0*b1.mass;

        frPulse2[axU] = -deltaV2*v_u_rel0*b2.mass;
        frPulse2[axV] = -deltaV2*v_v_rel0*b2.mass;
        
        b1.applyPulse(frPulse1);
        b2.applyPulse(frPulse2);
    }
    
    involvesBody(id) {
        return this.phaseA.body.id === id || this.phaseB.body.id === id;
    }
}

Physics.TouchingHitPhaseGraphEdge = class {
    constructor(nextBody, hitPhasePair) {
        this.nextBody = nextBody;
        this.hitPhasePair = hitPhasePair;
    }
}

Physics.DefaultCollisionManager = class {
    constructor() {
        
    }
    canTheyCollide(body1id,body2id, hitPhase1id, hitPhase2id) {
        if (body1id === body2id) return false;
        return true;
    }
}
Physics.DefaultCoefficientsManager = class {
    constructor(my,k) {
        this.my = my ?? 0.75;// gleitreibungskoeffizient
        this.k = k ?? 0.25;// elastizitätskoeffizient (0: vollkommen unelastisch, 1: vollkommen elastisch, dazwischen: was dazwischen halt)
    }
    getMy(body1id,body2id, hitPhase1id, hitPhase2id) {
        return this.my;
    }
    getK(body1id,body2id, hitPhase1id, hitPhase2id) {
        return this.k;
    }
}

