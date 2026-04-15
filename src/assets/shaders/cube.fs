precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uTexture;
uniform vec3 uAmbientLightColor;
uniform float uAmbientLightIntensity;
uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalLightDirection;
uniform float uDirectionalLightIntensity;

void main() {
	vec3 normal = normalize(vNormal);
	vec4 texColor = texture2D(uTexture, vTexCoord);

	float directionalFactor = max(dot(normal, -normalize(uDirectionalLightDirection)), 0.0);
	vec3 ambient = uAmbientLightColor * uAmbientLightIntensity;
	vec3 directional = uDirectionalLightColor * uDirectionalLightIntensity * directionalFactor;
	vec3 lighting = ambient + directional;

	vec3 finalColor = texColor.rgb * lighting;
	gl_FragColor = vec4(finalColor, texColor.a);
}