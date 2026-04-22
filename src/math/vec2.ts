import Vec from './vec';

class Vec2 extends Vec {

	constructor(x: number = 0, y: number = 0) {
		super([x, y]);
		this[0] = x;
		this[1] = y;
	}

	get x(): number { return this[0] as number; }
	get y(): number { return this[1] as number; }

	set x(value: number) { this[0] = value; }
	set y(value: number) { this[1] = value; }

	// TODO: add methods for vector operations (add, subtract, dot product, etc.)
}

function vec2(x: number = 0, y: number = 0): Vec2 {
	return new Vec2(x, y);
}

export { Vec2, vec2 };