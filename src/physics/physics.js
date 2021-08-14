const Physics = {};

Physics.World = class {
    constructor() {
        this.bodys = [];
        this.shocker = function(id1,id2) {return id1 !== id2};
        this.globalTime = 0;
    }
    tick(dt) {
        let t = 0;
        let shockList = [];
        let hitPhasesPairs = [];
        for (let b of this.bodys) b.timeOffset = 0;
        let M = 0;
        for (let ib1 = 0; ib1 < this.bodys.length; ib1++) for (let ib2 = 0; ib2 < ib1; ib2++) {
            let b1 = this.bodys[ib1];
            let b2 = this.bodys[ib2];
            if (!this.shocker(b1,b2)) continue;
            //console.log(b1,b2);
            let hps1 = b1.getHitPhases();
            let hps2 = b2.getHitPhases();
            for (let hp1 of hps1) for (let hp2 of hps2) {
                if (hp1.normaleAxis != hp2.normaleAxis) continue;
                if (hp1.sign == hp2.sign) continue;
                let ax = hp1.normaleAxis;
                hitPhasesPairs.push({
                    "hitPhases":[hp1,hp2],
                    "time":Physics._magicTimeFormula(
                        hp1.body.position[ax]+hp1.centerPos[ax],
                        hp1.body.velocity[ax],
                        hp1.body.timeOffset,
                        hp2.body.position[ax]+hp2.centerPos[ax],
                        hp2.body.velocity[ax],
                        hp2.body.timeOffset,
                        hp1.sign,
                        t, M
                    ),
                    "DEBUG____ID":M++
                });
            }
        }
        let n = 0;
        while (true) {
            //console.log(hitPhasesPairs);
            //alert();
            
            let minT = Infinity;
            let minTPair = undefined;
            for (let hitPhasePair of hitPhasesPairs) {
                if (hitPhasePair.time < minT) {
                    minTPair = hitPhasePair;
                    minT = hitPhasePair.time;
                }
            }
 //           console.log("minT" + n, minT, "global",this.globalTime + minT);
            if (minT > dt) break;
            if (!Physics._checkShock(minTPair)) {
                minTPair.time = Infinity;
                continue;
            }
            Physics._shock(minTPair);
            // console.log("SHOCK", minTPair);
            t = minT;
            
            //stoßzeiten für geänderte objekte neu berechnen
            let mhp1 = minTPair.hitPhases[0];
            let mhp2 = minTPair.hitPhases[1];
            for (let hitPhasePair of hitPhasesPairs) {
                let hp1 = hitPhasePair.hitPhases[0];
                let hp2 = hitPhasePair.hitPhases[1];
                let ax = hp1.normaleAxis;
                //wenn einer der Körper am stoß beteiligt war:
                if (hp1.body.id == mhp1.body.id || hp1.body.id == mhp2.body.id || hp2.body.id == mhp1.body.id || hp2.body.id == mhp2.body.id) {
                    hitPhasePair.time = Physics._magicTimeFormula(
                        hp1.body.position[ax]+hp1.centerPos[ax],
                        hp1.body.velocity[ax],
                        hp1.body.timeOffset,
                        hp2.body.position[ax]+hp2.centerPos[ax],
                        hp2.body.velocity[ax],
                        hp2.body.timeOffset,
                        hp1.sign,
                        t, hitPhasePair.DEBUG____ID
                    );
                }
//                console.log(n,hitPhasePair,hitPhasePair.time);
            }
            n++;
        }
        console.log(n);
        // da kein stoß mehr auftritt können alle Körper an ihre Endposition bewegt werden
        for (let b of this.bodys) {
            b.position[0] += b.velocity[0]*(dt - b.timeOffset);
            b.position[1] += b.velocity[1]*(dt - b.timeOffset);
            b.position[2] += b.velocity[2]*(dt - b.timeOffset);
        }
        this.globalTime += dt;
    }
    
}
Physics._magicTimeFormula = function(xA,vA,tOffsetA, xB,vB,tOffsetB, signA, currentT,  DEBUG____ID) {
//    console.log("debugId:" + DEBUG____ID,xA,vA,tOffsetA, xB,vB,tOffsetB, signA, currentT);
    if (vA == vB) return Infinity;// selbe geschwindigkeit: flächen werden NIE zusammen stoßen!
    if ((vA - vB)*signA > 0) return Infinity;// falsches vorzeichen: flächen sollen auch net stoßen
    let xA0 = xA - vA*tOffsetA;
    let xB0 = xB - vB*tOffsetB;
    let t = (xB0 - xA0)/(vA - vB);
  //  if (Math.abs(xB0 - xA0) < 0.0001) return currentT;
 //   if (t >= currentT) console.log("returns",t);
    if (t >= currentT) return t;
    if (Math.abs(t - currentT) < 0.0001) return currentT;
  //  if ((t - currentT) > 0.0001) console.log("BLENG",t - currentT);
    return Infinity;
}

Physics._checkShock = function(hitPhasePair) {
    let t = hitPhasePair.time;
    let hp1 = hitPhasePair.hitPhases[0];
    let hp2 = hitPhasePair.hitPhases[1];
    
    let ax = hp1.normaleAxis;
    let axU = (ax+1)%3;
    let axV = (ax+2)%3;
    
    let b1 = hp1.body;
    let b2 = hp2.body;
    
    let deltaU = b1.position[axU] + b1.velocity[axU]*(t-b1.timeOffset) - b2.position[axU] - b2.velocity[axU]*(t-b2.timeOffset);
    if (Math.abs(deltaU) >= (hp1.size[0] + hp2.size[0])/2) return false; // kein Stoß, weil flächen aneinander vorbei fliegen
    let deltaV = b1.position[axV] + b1.velocity[axV]*(t-b1.timeOffset) - b2.position[axV] - b2.velocity[axV]*(t-b2.timeOffset);
    if (Math.abs(deltaV) >= (hp1.size[1] + hp2.size[1])/2) return false; // kein Stoß, weil flächen aneinander vorbei fliegen
    return true;
}

Physics._shock = function(hitPhasePair) {
    //TODO testen, ob flächen aneinander vorbei fliegen
    
    
    let k = 0.3;//TODO
    let my = 0.5;
    

    let t = hitPhasePair.time;
    let hp1 = hitPhasePair.hitPhases[0];
    let hp2 = hitPhasePair.hitPhases[1];
    
    let ax = hp1.normaleAxis;
    let axU = (ax+1)%3;
    let axV = (ax+2)%3;
    
    let b1 = hp1.body;
    let b2 = hp2.body;


    let v1 = b1.velocity[ax];
    let v2 = b2.velocity[ax];
    
    let m1 = b1.mass;
    let m2 = b2.mass;
    
    // https://www.lernhelfer.de/schuelerlexikon/physik-abitur/artikel/einteilung-von-stoessen
    let v1new = (m1*v1 + m2*v2 - m2*(v1-v2)*k)/(m1+m2);
    let v2new = (m1*v1 + m2*v2 - m1*(v2-v1)*k)/(m1+m2);

    b1.position[0] += b1.velocity[0]*(t-b1.timeOffset);
    b1.position[1] += b1.velocity[1]*(t-b1.timeOffset);
    b1.position[2] += b1.velocity[2]*(t-b1.timeOffset);

    b2.position[0] += b2.velocity[0]*(t-b2.timeOffset);
    b2.position[1] += b2.velocity[1]*(t-b2.timeOffset);
    b2.position[2] += b2.velocity[2]*(t-b2.timeOffset);    
    
    let v_u_rel = b2.velocity[axU] - b1.velocity[axU];
    let v_v_rel = b2.velocity[axV] - b1.velocity[axV];
    let v_rel = Math.sqrt(v_u_rel*v_u_rel + v_v_rel*v_v_rel);
    let v_u_rel0 = 0;
    let v_v_rel0 = 0;
    let deltaV1_norm = Math.abs(v1new - v1);//betrag der geschwindigkeitsänderung auf der Stoßrichtung
    let deltaV2_norm = Math.abs(v2new - v2);

    if (v_rel > 0.0000000001) {
        v_u_rel0 = v_u_rel/v_rel;
        v_v_rel0 = v_v_rel/v_rel;
    }
    
    let deltaV1 = Math.min(deltaV1_norm*my,v_rel);//betrag der geschwindigkeitsänderung duch reibung auf der zum Stoß senkrechten ebene
    let deltaV2 = Math.min(deltaV2_norm*my,v_rel);//betrag der geschwindigkeitsänderung duch reibung auf der zum Stoß senkrechten ebene
    
    b1.velocity[ax] = v1new;
    b1.velocity[axU] += deltaV1*v_u_rel0;
    b1.velocity[axV] += deltaV1*v_v_rel0;

    b2.velocity[ax] = v2new;
    b2.velocity[axU] -= deltaV2*v_u_rel0;
    b2.velocity[axV] -= deltaV2*v_v_rel0;
    
    b1.timeOffset = t;
    b2.timeOffset = t;
    
//    console.log(b1,b2);
}

Physics.Body = class {
    constructor(id,position, velocity, mass) {
        this.id = id;
        this.position = position; //array [x,y,z]
        this.velocity = velocity; //array [x,y,z]
        this.mass = mass;
        this.hitPhases = undefined;
        
        this.timeOffset = 0;
    }
    setHitPhases(phases) {
        this.hitPhases = phases;
    }
    
    getHitPhases() {
        return this.hitPhases;
    }
    
}

Physics.HitPhase = class {
    constructor(body,centerPos,normaleAxis,sign,size) {
        this.body = body;
        this.centerPos = centerPos;
        this.normaleAxis = normaleAxis;
        this.sign = sign;
        this.size = size;//[u,v]    wenn normaleAxis=x: u=y, v=z; normaleAxis=y: u=z, v=x; normaleAxis=z: u=x, v=y;
    }
}
Physics.HitPhase.AXIS = {"X":0,"Y":1,"Z":2};
Physics.HitPhase.SIGN = {"POSITIVE":1,"NEGATIVE":-1};
