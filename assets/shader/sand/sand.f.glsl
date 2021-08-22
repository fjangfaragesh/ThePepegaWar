precision mediump float;
varying vec2 fragTexCoord;
varying vec3 fragNormale;
varying vec3 fragCoords;
uniform sampler2D sampler;

//https://www.shaderific.com/glsl-functions

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

vec4 sand(vec3 p) {
    vec4 ret = vec4(0.9,0.9,0.7,1.0);
    float n;// = fract((noise(p*20.0) + noise(p*53.0)*0.3 + noise(p*106.0)*0.1)*10.0)*(noise(p*73.1));
    //if (n > 0.1) ret = ret + vec4(-0.05,-0.05,-0.05,0.0);
    n = (clamp((noise(p*20.0 + 111.1) + noise(p*53.0 + 111.1)*0.3 + noise(p*106.0 + 111.1)*0.1)*25.0,-1.0,1.0) * clamp(noise(p*73.1 + 111.1)*10.0,-1.0,1.0))*0.03;
    ret = ret + vec4(n,n,n,0.0);
    
    return ret;
}

void main() {
    vec3 lightDirection = normalize(vec3(-0.5,1.0,0.5));
    float ligthIntensity = max(0.0, dot(fragNormale,lightDirection))*0.8 + 0.2;
    vec4 texColor = sand(fragCoords);
    
    gl_FragColor = vec4(vec3(texColor)*ligthIntensity,texColor.w);
    //gl_FragColor = vec4(0.5*fragNormale + vec3(0.5,0.5,0.5),1.0);
    //gl_FragColor = vec4(ligthIntensity,ligthIntensity,ligthIntensity,1.0);
}
