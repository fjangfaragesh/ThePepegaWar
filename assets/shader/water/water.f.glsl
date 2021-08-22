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

float water(vec3 p) {
    p = p*vec3(0.07,0.07,0.001);
    return (sin((noise(p*20.0 + 111.1) + noise(p*53.0 + 111.1)*0.3 + noise(p*106.0 + 111.1)*0.1)*25.0 + (p.z*10000.0)) * noise(p*60.1))*0.1;

}

void main() {
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));
    vec4 texColor = vec4(0.2,0.3,0.8,1.0);
    
    vec3 animationCoords = vec3(fragCoords.x,fragCoords.z, time);
    
    float p00 = water(animationCoords);
    float p10 = water(animationCoords + vec3(0.01, 0.0, 0.0));
    float p01 = water(animationCoords + vec3(0.0, 0.0, 0.01));
    
    vec3 gradX = vec3(1.0, (p10 - p00)/0.01, 0.0);
    vec3 gradZ = vec3(0.0, (p01 - p00)/0.01, 1.0);
    
    vec3 fragNormaleWater = normalize(cross(gradZ,gradX));
    float ligthIntensity = max(0.0, dot(fragNormaleWater,lightDirection))*0.8 + 0.2;
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);
}
