import { Vec3, vec3 } from "../../math/vec3";
import Color from "../../utils/color";
import BaseModel, { BaseModelOptions } from "../model";

export enum LightType {
	Point = 'point',
	Directional = 'directional',
	Spot = 'spot'
}

export interface LightOptions extends BaseModelOptions {
	color?: Color;
	intensity?: number;
	position?: Vec3;
	type?: LightType;
}

abstract class Light extends BaseModel {

	protected _color: Color;
	protected _intensity: number;
	protected _position: Vec3;
	protected _type: LightType;

	constructor(options: LightOptions = {}) {
		super(options);

		this._color = options.color || Color.white();
		this._intensity = options.intensity ?? 1.0;
		this._position = options.position || vec3();
	}

	get type(): LightType { return this._type; }

	get color(): Color { return this._color; }
	set color(value: Color) {
		this._color = value;
		this.trigger('modelUpdated', "color", value);
	}

	get intensity(): number { return this._intensity; }
	set intensity(value: number) {
		this._intensity = value;
		this.trigger('modelUpdated', "intensity", value);
	}

	get position(): Vec3 { return this._position; }
	set position(v: Vec3) {
		this._position = v;
		this.trigger('modelUpdated', "position", v);
	}

	// TODO: return type for all inherited classes
	getUniformData(): {
		color: Color,
		intensity: number,
		position: Vec3
	} {
		return {
			color: this._color,
			intensity: this._intensity,
			position: this._position
		};
	}
}

export default Light;