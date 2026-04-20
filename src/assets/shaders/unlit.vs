attribute vec3 aPosition;
// uniform float uPointSize;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main() {
    gl_PointSize = 5.0;
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}
