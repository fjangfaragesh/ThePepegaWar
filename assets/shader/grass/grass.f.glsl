precision mediump float;
varying vec2 fragTexCoord;
varying vec3 fragNormale;
varying vec3 fragCoords;
uniform sampler2D sampler;
uniform float time;

vec3 random2(vec3 p){
    p = vec3(dot(p,vec3(127.1,311.7,391.2)),dot(p,vec3(269.5,183.3,717.3)),dot(p,vec3(423.5,553.7,114.8)));
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

vec4 grass(vec3 p, float t) {
    //float windX = noise(vec3(t,0.0,0.0));
    //float windY = noise(vec3(t,0.0,0.0));
    p = p*4.0;
    
    
    vec4 color = vec4(0.5,0.8,0.3, 1.0);
    float n = 1.0 - clamp( noise(p*10.0)*noise(p*20.0+1.3), -0.1,0.1) + clamp( sin(noise(p)*3.0)*0.025,-0.02,0.02);
    color = color*vec4(n,n,n,1.0);
    
    return color;
}

void main() {
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));
    float ligthIntensity = max(0.0, dot(fragNormale,lightDirection))*0.8 + 0.2;
    vec4 texColor = grass(fragCoords,time);
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);
}
