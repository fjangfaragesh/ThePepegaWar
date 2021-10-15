precision mediump float;
varying vec2 fragTexCoord;
varying vec3 fragNormale;
varying vec3 fragCoords;
uniform sampler2D sampler;

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

vec4 stone(vec3 p) {
    p = p*3.0;
    float n = noise(p*5.0 + vec3(100.0,25.0,18.0)) + noise(p*20.0 + vec3(22.0,25.0,18.0))*0.1 + noise(p*100.0 + vec3(434.0,39.4,54.0))*0.03;
    if (n > 0.2) return vec4(0.545,0.545,0.545,1.0);
    if (n > 0.1) return vec4(0.565,0.565,0.565,1.0);
    n = noise(p*20.0) + noise(p*100.0)*0.1;
    if (n > 0.4) return vec4(0.445,0.465,0.485,1.0);
    n = noise(p*4.0) + noise(p*31.0)*0.1;
    if (n > 0.1) return vec4(0.585,0.579,0.585,1.0);
    n = noise(p*10.0) + noise(p*54.0)*0.1;
    if (n > 0.1) return vec4(0.579,0.579,0.599,1.0);
    return vec4(0.625,0.625,0.625,1.0);
}

void main() {
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));
    float ligthIntensity = max(0.0, dot(fragNormale,lightDirection))*0.8 + 0.2;// 0.2 : ambient ligth
    vec4 texColor = stone(fragCoords);
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);
}
