const ThreeDAudio = {};
ThreeDAudio.SPEED_OF_SOUND = 100;//343
ThreeDAudio.STEREO_INTENSITY = 0.8;


// https://stackoverflow.com/questions/20287890/audiocontext-panning-audio-of-playing-media
ThreeDAudio.Player = class {
    constructor(audioContext, channelIds) {
        this.audioContext = audioContext;
        //window.audioContext = window.audioContext||window.webkitAudioContext;
        //var context = new AudioContext();
        audioContext.createGain = audioContext.createGain||audioContext.createGainNode;
        
        this.channels = {};
        this.channelsLastUse = {};
        this.channelsLastUseCounter = 1;
        for (let cid of channelIds) {
            this.channels[cid] = new ThreeDAudio.Channel(this);
            this.channelsLastUse[cid] = 0;
        }
        
        this.ears = new ThreeDAudio.Ears([0.0,0.0,0.0],[0.0,0.0,0.0],[1.0,0.0,0.0]);
    }
//  spielt den Sound ab
    addSound(playingSound, channelId) {
        if (channelId instanceof Array) channelId = this.findFreeChanelIfPossible(channelId);
        
        if (this.channels[channelId] !== undefined) {
            this.channels[channelId].setPlayingSound(playingSound);
            this.channelsLastUse[channelId] = this.channelsLastUseCounter++;
        }
    }
    findFreeChanelIfPossible(channelIds) {
        let best = undefined;
        let bestLastUse = Infinity;
        for (let cid of channelIds) {
            if (this.channels[cid] === undefined) continue;
            if (!this.channels[cid].isPlaying()) return cid;
            if (this.channelsLastUse[cid] < bestLastUse) {
                best = cid;
                bestLastUse = this.channelsLastUse[cid];
            }
        }
        return best;
    }
    
    setEars(ears) {
        this.ears = ears;
        // this.tick() ??
    }
    
//  berechnet dopplereffekt und lautstäke aller Kanäle neu
    tick() {
        let kys = Object.keys(this.channels);
        for (let k of kys) this.channels[k].tick();
    }
}
ThreeDAudio.Channel = class {
    constructor(player) {
        this.player = player;
        this.gainL = this.player.audioContext.createGain();
        this.gainR = this.player.audioContext.createGain();

        this.splitter = this.player.audioContext.createChannelSplitter(2);
        this.merger = this.player.audioContext.createChannelMerger(2);
                
        this.splitter.connect(this.gainL, 0);
        this.splitter.connect(this.gainR, 1);

        this.gainL.connect(this.merger, 0, 0);
        this.gainR.connect(this.merger, 0, 1);
        
        this.merger.connect(this.player.audioContext.destination);
        
        this.source = undefined;// solange das nicht undefined ist, spielt hier die Musik
        this.playingSound = undefined;
        
        this.settingTime = undefined;
        this.delayEnded = false;
    }
    // dopplereffekt, lautstärke, ... neu berechnen
    tick() {
        if (this.source === undefined) return;
        let {gainLeft,gainRight,speed,delay} = this.player.ears.calc(this.playingSound.position, this.playingSound.velocity);
        //console.log(gainLeft,gainRight,speed,delay);
        this.gainL.gain.value = gainLeft*this.playingSound.volumne;
        this.gainR.gain.value = gainRight*this.playingSound.volumne;
        
        this.source.playbackRate.value = speed;
    }
    
    
    setPlayingSound(playingSound) {
        let current = this;
        this.stop();
        
        if (playingSound === undefined) return;
        
        this.source = this.player.audioContext.createBufferSource();
        this.source.buffer = playingSound.audioBuffer;        
        this.source.loop = playingSound.loopEnable;
        this.source.loopStart = playingSound.loopStartTime;
        
        this.playingSound = playingSound;
        
        this.source.onended = function() {
            playingSound.onEnded();
            current.source = undefined;
            current.playingSound = undefined;
        }
        
        let {gainLeft,gainRight,speed,delay} = this.player.ears.calc(this.playingSound.position, this.playingSound.velocity);
        
        delay = Math.round(delay*1000);// delay in ms
        
        this.gainL.gain.value = gainLeft*this.playingSound.volumne;
        this.gainR.gain.value = gainRight*this.playingSound.volumne;
        this.source.playbackRate.value = speed;
        
        this.settingTime = Date.now();
        this.delayEnded = false;
        
        if (delay === 0) {
            this._startNow();
        } else {
            this._startAt(this.settingTime+delay);
        }
        
        this.source.connect(this.splitter, 0, 0);
        
        
        playingSound.onStarted();// trotzdem ausgeführt, auch wenn delay noch net abgelaufen ist
        
        // this.tick();
    }
    
    _startNow() {
        this.delayEnded = true;
        this.source.start(0);
    }
    _startAt(timeMs) {
        let current = this;
        
        if (this.delayTimeout !== undefined) clearTimeout(this.delayTimeout);
        let deltaMs = timeMs-Date.now();
        
        if (deltaMs > 0) {
            this.delayTimeout = setTimeout(function() {current._startNow()},deltaMs);
        } else {
            this._startNow();
        }
    }
    
    
    stop() {
        if (this.delayTimeout !== undefined) clearTimeout(this.delayTimeout);
        if (this.source !== undefined) this.source.stop(); // man muss anscheinend kein close() machen
        this.source = undefined;
        this.playingSound = undefined;
    }
    isPlaying() {
        return this.source !== undefined;
    }
    
}


ThreeDAudio.PlayingSound = class {
    constructor(audioBuffer, onEndedF, position, velocity, volumne, loopEnable, loopStartTime) {
        this.audioBuffer = audioBuffer;
        this.onEndedF = onEndedF;
        this.channel = undefined;
        this.started = false;
        this.ended = false;
        
        this.position = position;
        this.velocity = velocity;
        this.volumne = volumne;
        
        this.loopEnable = loopEnable ?? false;
        this.loopStartTime = loopStartTime ?? 0.0;
    }
    setPosition(p) {
        this.position = p;
    }
    setVelocity(v) {
        this.velocity = v;
    }
    
    stop() {
        if (!this.ended) if (this.channel !== undefined) this.channel.stop();
    }
    
    onStarted() {
        this.started = true;
    }
    onEnded() {
        this.ended = true;
        if (this.onEndedF !== undefined) this.onEndedF();
    }
}

ThreeDAudio.Ears = class {
    // rightEarAxis must be normalized vector
    constructor(position, velocity, rightEarAxis) {
        this.position = position;
        this.rightEarAxis = rightEarAxis;
        this.velocity = velocity;
    }
    setPosition(p) {
        this.position = p;
    }
    setVelocity(v) {
        this.velocity = v;
    }
    setRightEarAxis(r) {
        this.rightEarAxis = r;
    }
    
    calc(soundPosition, soundVelocity) {
        if (soundPosition === undefined) return {gainLeft: 1.0, gainRight: 1.0, speed: 1.0, delay: 0.0};
        let v = [
            soundVelocity[0]-this.velocity[0],
            soundVelocity[1]-this.velocity[1],
            soundVelocity[2]-this.velocity[2]
        ];
        let p = [
            soundPosition[0]-this.position[0],
            soundPosition[1]-this.position[1],
            soundPosition[2]-this.position[2]
        ];
        let pLength = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
        let volumne = 1.0/(pLength*pLength+1.0); // eigentlich nur 1/(r^2) da aber bei r<1 das sonst extrem laut
        
        let gainLeft = volumne;
        let gainRight = volumne;
        let speed = 1.0;
        if (pLength > 0.001) {
            let p0 = [p[0]/pLength, p[1]/pLength, p[2]/pLength];
            let p0vScalar = p0[0]*v[0] + p0[1]*v[1] + p0[2]*v[2];
            
            let ratio = Math.max(0.01, p0vScalar/ThreeDAudio.SPEED_OF_SOUND);// begrenzung: zubewegen mit überschallgeschwindigkeit nicht unterstützt
            
            // https://de.wikipedia.org/wiki/Doppler-Effekt
            speed = Math.max(0.01, 1.0/(1.0 + ratio));
            
            let p0earScalar = p0[0]*this.rightEarAxis[0] + p0[1]*this.rightEarAxis[1] + p0[2]*this.rightEarAxis[2];
            gainRight *= (1+p0earScalar)*ThreeDAudio.STEREO_INTENSITY + (1-ThreeDAudio.STEREO_INTENSITY);
            gainLeft *= (1-p0earScalar)*ThreeDAudio.STEREO_INTENSITY + (1-ThreeDAudio.STEREO_INTENSITY);
        }

                    
                
        return {gainLeft: gainLeft, gainRight: gainRight, speed: speed, delay: pLength/ThreeDAudio.SPEED_OF_SOUND};
    }
}
