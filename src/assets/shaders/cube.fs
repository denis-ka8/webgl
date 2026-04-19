precision mediump float;

varying vec2 vTexCoord;
varying vec3 vNormal;
varying vec3 vWorldPos;

uniform sampler2D uNormalTexture;
uniform sampler2D uAoTexture;
uniform sampler2D uRoughnessTexture;
uniform samplerCube uEnvironmentMap;

uniform vec3 uBaseColor;
uniform float uMetallic;
uniform float uRoughness;

uniform vec3 uAmbientLightColor;
uniform float uAmbientLightIntensity;
uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalLightDirection;
uniform float uDirectionalLightIntensity;

uniform vec3 uCameraPosition;

const float PI = 3.14159265359;

float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a2 = roughness * roughness * roughness * roughness;
    float NdotH = max(dot(N, H), 0.0);
    float denom = (NdotH * NdotH * (a2 - 1.0) + 1.0);
    return a2 / (PI * denom * denom);
}

float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    return geometrySchlickGGX(max(dot(N, L), 0.0), roughness) *
           geometrySchlickGGX(max(dot(N, V), 0.0), roughness);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 getNormalFromMap() {
    vec3 tangentNormal = texture2D(uNormalTexture, vTexCoord).xyz * 2.0 - 1.0;
    tangentNormal.xy = tangentNormal.xy * 2.0 - 1.0;
    return normalize(vNormal + tangentNormal);
}

void main() {
    vec3 normal = getNormalFromMap();
    vec3 viewDir = normalize(uCameraPosition - vWorldPos);
    vec3 lightDir = normalize(-uDirectionalLightDirection);

    float ao = texture2D(uAoTexture, vTexCoord).r;
    float roughness = texture2D(uRoughnessTexture, vTexCoord).r;
    roughness = mix(roughness, uRoughness, 0.5);

    // Базовый коэффициент Френеля: 4 % для диэлектриков, цвет материала для металлов
    vec3 F0 = mix(vec3(0.04), uBaseColor, uMetallic);

    // Полувектор
    vec3 halfwayDir = normalize(lightDir + viewDir);

    // Компоненты BRDF
    float NDF = distributionGGX(normal, halfwayDir, roughness);           // Распределение микрограней (GGX)
    float G = geometrySmith(normal, viewDir, lightDir, roughness);     // Геометрическое затенение
    vec3 F = fresnelSchlick(max(dot(halfwayDir, viewDir), 0.0), F0); // Френелевское отражение

    // Расчёт зеркальной составляющей
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, lightDir), 0.0);
    vec3 specular = numerator / max(denominator, 0.001);

    // Диффузная составляющая: уменьшается для металлов
    vec3 kD = vec3(1.0) - F;
    kD *= 1.0 - uMetallic;

    // Диффузное освещение
    float directionalFactor = max(dot(normal, lightDir), 0.0);
    vec3 ambient = uAmbientLightColor * uAmbientLightIntensity * ao;
    vec3 directional = uDirectionalLightColor * uDirectionalLightIntensity * directionalFactor;
    vec3 lighting = ambient + directional;

    // Рачсет отражений окружения
    vec3 reflection = reflect(-viewDir, normal);
    vec3 environmentColor = textureCube(uEnvironmentMap, reflection).rgb;

    // Смешиваем зеркальную составляющую с отражением окружения
    // Для металлических поверхностей — больше отражения окружения, для диэлектриков — меньше
    vec3 envSpecular = environmentColor * mix(0.1, 1.0, uMetallic);
    specular = mix(specular, envSpecular, mix(0.2, 0.8, uMetallic));

    // Финальный цвет: диффузный + зеркальный + отражения окружения
    vec3 finalColor = lighting * (kD * uBaseColor / PI) + specular;

    gl_FragColor = vec4(finalColor, 1.0);
}
