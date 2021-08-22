#ifdef GL_ES
precision mediump float;
#endif

//https://thebookofshaders.com/edit.php#11/2d-gnoise.frag (wurde auf 3d angepasst)

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 random2(vec3 p){
    p = vec3( dot(p,vec3(127.1,311.7,951.431)),
              dot(p,vec3(269.5,183.3,717.3)),
             dot(p,vec3(423.5,553.7,114.8)));
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
/*
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(0.0);

    vec2 pos = vec2(st*10.0);

    color = vec3( fract(noise(vec3(pos,1.0))*5.0+.5) );

    gl_FragColor = vec4(color,1.0);
}
*/
