precision mediump float;
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
attribute vec3 vertNormale;
uniform mat4 mObject;
uniform mat4 mView;
varying vec2 fragTexCoord;
varying vec3 fragNormale;
varying vec3 fragCoords;
void main() {
    fragTexCoord = vertTexCoord;
    fragNormale = normalize(vec3(mObject * vec4(vertNormale, 0.0)));
    fragTexCoord.y = 1.0 - fragTexCoord.y;
    gl_Position = mView * mObject * vec4(vertPosition, 1.0);
    fragCoords = vec3(mObject * vec4(vertPosition, 1.0));
}
