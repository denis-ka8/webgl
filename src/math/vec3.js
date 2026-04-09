import Vec from "./vec";

class Vec3 extends Vec {

	constructor(x = 0, y = 0, z = 0) {
		super(3);
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}

	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }

	set x(value) { this[0] = value; }
	set y(value) { this[1] = value; }
	set z(value) { this[2] = value; }

	// TODO: add methods for vector operations (add, subtract, dot product, cross product, etc.)
}

function vec3(x = 0, y = 0, z = 0) {
	return new Vec3(x, y, z);
}

export { vec3 };