import { vec3 } from "../../math/vec3"
import Color from "../../utils/color"
import BaseModel from "../model"

const TYPES = {
	Point: 'point',
	Directional: 'directional',
	Spot: 'spot'
};

class Light extends BaseModel {
	// TODO: pass options object instead of individual parameters
	constructor(color = Color.white(), intensity = 1.0) {
		super();
		this._color = color;
		this._intensity = intensity;
		this._position = vec3();
		this._direction = vec3(0, -1, 0);
	}

	get direction() { return this._direction; }
	set direction(v) {
		this._direction = v;
		this.trigger('modelUpdated', "direction", v);
	}

	// TODO: add other property getters/setters and trigger 'modelUpdated' event on change

	getUniformData() {
		return {
			color: this._color,
			intensity: this._intensity,
			position: this._position,
			direction: this._direction
		};
	}

	static get Types() { return TYPES; }
}

export default Light;