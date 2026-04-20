import Vec from "./vec";

class Vec3 extends Vec {

	constructor(x: number = 0, y: number = 0, z: number = 0) {
		super([x, y, z]);
	}

	get x(): number { return this[0] as number; }
	get y(): number { return this[1] as number; }
	get z(): number { return this[2] as number; }

	set x(value: number) { this[0] = value; }
	set y(value: number) { this[1] = value; }
	set z(value: number) { this[2] = value; }

	static normalize(v: Vec3): Vec3 {
		const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
		if (length === 0) return new Vec3();
		return new Vec3(v.x / length, v.y / length, v.z / length);
	}

	static subtract(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	static cross(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}

	copy(): Vec3 {
		return new Vec3(this.x, this.y, this.z);
	}

	add(v: Vec3): Vec3 {
		return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
	}

	scale(value: number): Vec3 {
		return new Vec3(this.x * value, this.y * value, this.z * value);
	}

	dot(v: Vec3): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	normalize(): Vec3 {
		const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		if (length === 0) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}
		return this;
	}

	toArray(): number[] {
		return [ this.x, this.y, this.z ];
	}

	// TODO: add methods for vector operations (add, subtract, dot product, cross product, etc.)
}

function vec3(x: number = 0, y: number = 0, z: number = 0): Vec3 {
	return new Vec3(x, y, z);
}

export { Vec3, vec3 };