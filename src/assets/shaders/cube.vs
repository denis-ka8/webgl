attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec3 uModelPosition;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
	vTexCoord = aTexCoord;
	vNormal = aNormal;
	gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition + uModelPosition, 1.0);
}