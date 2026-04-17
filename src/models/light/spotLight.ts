import PointLight, { PointLightOptions } from "./pointLight";
import { LightType } from "./light";
import Color from "../../utils/color";
import { Vec3 } from "../../math/vec3";

export interface SpotLightOptions extends PointLightOptions {
	angle?: number;    // угол конуса света в градусах
	penumbra?: number; // степень размытия тени
}

class SpotLight extends PointLight {

	private _angle: number;
	private _penumbra: number;

	constructor(options: SpotLightOptions = {}) {
		super(options);
		this._angle = options.angle ?? 45;
		this._penumbra = options.penumbra ?? 0.1;
		this._type = LightType.Spot;
	}

	get angle(): number {
		return this._angle;
	}

	set angle(value: number) {
		this._angle = value;
		this.trigger('modelUpdated', "angle", value);
	}

	get penumbra(): number {
		return this._penumbra;
	}

	set penumbra(value: number) {
		this._penumbra = value;
		this.trigger('modelUpdated', "penumbra", value);
	}
	
	getUniformData(): {
		color: Color,
		intensity: number,
		position: Vec3,
		type: LightType,
		range: number,
		angle: number,
		penumbra: number
	} {
		return {
			...super.getUniformData(),
			type: this._type,
			angle: this._angle,
			penumbra: this._penumbra
		}
	}
}

export default SpotLight;