attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform vec3 uModelPosition;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
	vTexCoord = aTexCoord;
	vNormal = aNormal;
	vWorldPos = aPosition + uModelPosition;
	gl_Position = uProjectionMatrix * uViewMatrix * vec4(vWorldPos, 1.0);
}