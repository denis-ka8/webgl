import Light, { LightType, LightOptions } from "./light";
import { Vec3, vec3 } from "../../math/vec3";
import Color from "../../utils/color";

export interface DirectionalLightOptions extends LightOptions {
	direction?: Vec3;
}

class DirectionalLight extends Light {

	private _direction: Vec3;

	constructor(options: DirectionalLightOptions = {}) {
		super(options);
		this._direction = options.direction || vec3(0, -1, 0);
		this._type = LightType.Directional;
	}

	get direction(): Vec3 { return this._direction; }
	set direction(v: Vec3) {
		this._direction = v;
		this.trigger('modelUpdated', "direction", v);
	}

	getUniformData(): {
		color: Color,
		intensity: number,
		position: Vec3,
		type: LightType,
		direction: Vec3
	} {
		return {
			...super.getUniformData(),
			type: this._type,
			direction: this._direction
		}
	}
}

export default DirectionalLight;