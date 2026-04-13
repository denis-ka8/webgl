precision mediump float;

uniform sampler2D uTexture;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
	vec4 texColor = texture2D(uTexture, vTexCoord);
	texColor = vec4(1.0, 0.0, 0.0, 1.0);
	gl_FragColor = texColor;
}