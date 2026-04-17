import Light, { LightType, LightOptions } from "./light";
import Color from "../../utils/color";
import { Vec3 } from "../../math/vec3";

export interface PointLightOptions extends LightOptions {
	range?: number;
}

class PointLight extends Light {

	private _range: number;

	constructor(options: PointLightOptions = {}) {
		super(options);
		this._range = options.range ?? 10.0; // дальность затухания света
		this._type = LightType.Point;
	}

	get range(): number {
		return this._range;
	}

	set range(value: number) {
		this._range = value;
		this.trigger('modelUpdated', "range", value);
	}
	
	getUniformData(): {
		color: Color,
		intensity: number,
		position: Vec3,
		type: LightType,
		range: number
	} {
		return {
			...super.getUniformData(),
			type: this._type,
			range: this._range
		}
	}
}

export default PointLight;