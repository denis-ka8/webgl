precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform sampler2D uNormalTexture;
uniform sampler2D uAoTexture;
uniform sampler2D uRoughnessTexture;

uniform vec3 uBaseColor;
uniform float uMetallic;
uniform float uRoughness;

uniform vec3 uAmbientLightColor;
uniform float uAmbientLightIntensity;
uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalLightDirection;
uniform float uDirectionalLightIntensity;

uniform vec3 uCameraPosition;

vec3 getNormalFromMap() {
	vec3 tangentNormal = texture2D(uNormalTexture, vTexCoord).xyz * 2.0 - 1.0;
	tangentNormal.xy = tangentNormal.xy * 2.0 - 1.0;
	return normalize(vNormal + tangentNormal);
}

void main() {
	vec3 normal = getNormalFromMap();
	vec3 viewDir = normalize(uCameraPosition - vWorldPos);  // Вектор от фрагмента к камере
	// vec3 reflectDir = reflect(-viewDir, normal);  // Вектор отражения
	vec3 lightDir = normalize(-uDirectionalLightDirection);

	float ao = texture2D(uAoTexture, vTexCoord).r;
	float roughness = texture2D(uRoughnessTexture, vTexCoord).r;
	roughness = mix(roughness, uRoughness, 0.5);

	// Расчёт зеркального отражения
	vec3 halfwayDir = normalize(lightDir + viewDir);  // Полувектор
	// float specular = pow(max(dot(reflectDir, normalize(-uDirectionalLightDirection)), 0.0), 32.0 * (1.0 - roughness));
	float specular = pow(max(dot(normal, halfwayDir), 0.0), 32.0 * (1.0 - roughness));
	vec3 specularColor = vec3(specular) * uDirectionalLightColor * uMetallic;  // Металлические поверхности отражают цвет света

	// Диффузное освещение
	// float directionalFactor = max(dot(normal, -normalize(uDirectionalLightDirection)), 0.0);
	float directionalFactor = max(dot(normal, lightDir), 0.0);
	vec3 ambient = uAmbientLightColor * uAmbientLightIntensity * ao;
	vec3 directional = uDirectionalLightColor * uDirectionalLightIntensity * directionalFactor;
	vec3 lighting = ambient + directional;

	// Финальный цвет: диффузный + зеркальный
	// vec3 finalColor = uBaseColor * lighting * (1.0 - uMetallic) + vec3(roughness);
	vec3 finalColor = uBaseColor * lighting * (1.0 - uMetallic) + specularColor;
	gl_FragColor = vec4(finalColor, 1.0);
}