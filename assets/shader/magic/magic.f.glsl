precision mediump float;
varying vec2 fragTexCoord;
varying vec3 fragNormale;
varying vec3 fragCoords;
uniform sampler2D sampler;
uniform float time;

vec3 random2(vec3 p){
    p = vec3(dot(p,vec3(127.1,311.7,951.431)),dot(p,vec3(269.5,183.3,717.3)),dot(p,vec3(423.5,553.7,114.8)));
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    vec3 u = f*f*(3.0-2.0*f);

    return mix(mix( mix( dot( random2(i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ),
                     dot( random2(i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                mix( dot( random2(i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ),
                     dot( random2(i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
        
        mix( mix( dot( random2(i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ),
                     dot( random2(i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                mix( dot( random2(i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ),
                     dot( random2(i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y),u.z);
}

vec4 magic(vec3 p, float t) {
    p = p*0.3;

    float c = noise(p+vec3(0.0,t,0.0));
    float d = noise(p*10.0+vec3(0.0,0.0,t*0.001));
    float e = noise(p*40.0+vec3(0.0,-t*0.1,0.0));
    
    
    float r = clamp(sin(c*100.0 + d*100.0)*3.0*d - cos(e*16.0-0.3)*1.5 - 1.2,0.0,0.5);
    float g = clamp(sin(c*100.0 + d*1.0)*5.0*d - e*2.0 - 2.0,0.0,1.0);
    float b = clamp(sin(c*100.0 + d*100.0)*5.0*d - cos(e*16.0)*2.0 - 2.0,0.0,1.0);
    return vec4(r,g,b,1.0);
}


void main() {
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));
    vec4 texColor = magic(fragCoords, time);
    
    

    //float ligthIntensity = max(0.0, dot(fragNormale,lightDirection))*0.8 + 0.2;
    float ligthIntensity = 1.0;
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);
}
