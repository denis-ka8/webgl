#include <emscripten.h>
#include <emscripten/val.h>
#include <vector>

std::vector<float> calculateNormal(
	float x1, float y1, float z1,
	float x2, float y2, float z2,
	float x3, float y3, float z3
) {
	std::vector<float> normal(3);

	float edge1x = x2 - x1;
	float edge1y = y2 - y1;
	float edge1z = z2 - z1;

	float edge2x = x3 - x1;
	float edge2y = y3 - y1;
	float edge2z = z3 - z1;

	normal[0] = edge1y * edge2z - edge1z * edge2y;
	normal[1] = edge1z * edge2x - edge1x * edge2z;
	normal[2] = edge1z * edge2y - edge1y * edge2x;

	float length = sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
	if (length > 0) {
		normal[0] /= length;
		normal[1] /= length;
		normal[2] /= length;
	}

	return normal;
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
	void calculateNormals(float* vertices, float* normals, int vertexCount) {
		int i, j;
		for (i = 0; i < vertexCount; i += 9) {
			auto normal = calculateNormal(
				vertices[i], vertices[i+1], vertices[i+2],
				vertices[i+3], vertices[i+4], vertices[i+5],
				vertices[i+6], vertices[i+7], vertices[i+8]
			);
			for (j = 0; j < 3; j++) {
				normals[i + j*3] = normal[0];
				normals[i + j*3 + 1] = normal[1];
				normals[i + j*3 + 2] = normal[2];
			}
		}
	}
}