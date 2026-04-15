precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;

uniform sampler2D uTexture;

void main() {
	vec3 normal = normalize(vNormal);
	vec3 lightDir = normalize(vec3(0.5, 0.7, 1.0));
	float diffuse = max(dot(normal, lightDir), 0.0);
	vec4 texColor = texture2D(uTexture, vTexCoord);
	vec3 finalColor = texColor.rgb * (diffuse * 0.8 + 0.2);
	gl_FragColor = vec4(finalColor, texColor.a);
}