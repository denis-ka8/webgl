class Color {

	private readonly _data: Float32Array = new Float32Array(4);

	constructor(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0) {
		this.set(r, g, b, a);
	}

	get r(): number { return this._data[0] as number; }
	set r(value: number) { this._data[0] = this._clamp(value); }

	get g(): number { return this._data[1] as number; }
	set g(value: number) { this._data[1] = this._clamp(value); }

	get b(): number { return this._data[2] as number; }
	set b(value: number) { this._data[2] = this._clamp(value); }

	get a(): number { return this._data[3] as number; }
	set a(value: number) { this._data[3] = this._clamp(value); }

	set(r: number, g: number, b: number, a: number): this {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		return this;
	}

	clone(): Color {
		return new Color(this.r, this.g, this.b, this.a);
	}

	equals(other: Color): boolean {
		return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
	}

	toArray(): Float32Array {
		return this._data;
	}

	toRGBArray(): Float32Array {
		return this._data.slice(0, 3);
	}

	private _clamp(value: number): number {
		return Math.max(0.0, Math.min(1.0, value));
	}

	static white(): Color { return new Color(1.0, 1.0, 1.0); }

	static black(): Color { return new Color(); }

	static red(): Color { return new Color(1.0, 0.0, 0.0); }

	static green(): Color { return new Color(0.0, 1.0, 0.0); }

	static blue(): Color { return new Color(0.0, 0.0, 1.0); }

	static gray(intensity: number = 0.5): Color { return new Color(intensity, intensity, intensity); }

	static fromHex(hex: string): Color {
		if (hex == null) {
			throw new Error('Hex color cannot be null or undefined');
		}
		if (hex.startsWith('#')) hex = hex.slice(1);

		const safeGetChar = (str: string, index: number, defaultValue: string = '0'): string => {
			if (index < 0 || index >= str.length) return defaultValue;
			return str[index] ?? defaultValue;
		};

		if (hex.length === 3) {
			const rChar = safeGetChar(hex, 0);
			const gChar = safeGetChar(hex, 1);
			const bChar = safeGetChar(hex, 2);
			const r = parseInt(rChar + rChar, 16) / 255;
			const g = parseInt(gChar + gChar, 16) / 255;
			const b = parseInt(bChar + bChar, 16) / 255;
			return new Color(r, g, b);
		} else if (hex.length === 6) {
			const rStr = safeGetChar(hex, 0) + safeGetChar(hex, 1);
			const gStr = safeGetChar(hex, 2) + safeGetChar(hex, 3);
			const bStr = safeGetChar(hex, 4) + safeGetChar(hex, 5);
			const r = parseInt(rStr, 16) / 255;
			const g = parseInt(gStr, 16) / 255;
			const b = parseInt(bStr, 16) / 255;
			return new Color(r, g, b);
		} else {
			throw new Error('Invalid hex color format');
		}
	}

	static fromRGBA(r: number, g: number, b: number, a: number = 255): Color {
		return new Color(r / 255, g / 255, b / 255, a / 255);
	}

	private static _safeGetChar(str: string, index: number, defaultValue: string = '0'): string {
		if (index < 0 || index >= str.length) return defaultValue;
		return str[index] ?? defaultValue;
	}
}

export default Color;