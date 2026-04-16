class Vec extends Float32Array {

	constructor(sizeOrArray: number | Array<number> | Float32Array = 0) {
		if (Array.isArray(sizeOrArray) || sizeOrArray instanceof Float32Array) {
			super(sizeOrArray);
		} else {
			super(sizeOrArray);
			this.fill(0);
		}
	}
}

export default Vec;