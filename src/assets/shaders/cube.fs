precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
	vec3 normal = normalize(vNormal);
	vec3 baseColor = abs(normal) * 0.5 + 0.3;
	vec3 uvColor = vec3(vTexCoord, 1.0 - vTexCoord.x);
	vec3 color = mix(baseColor, uvColor, 0.3);
	gl_FragColor = vec4(color, 1.0);
}