import { vec3 } from "../../math/vec3"
import Color from "../../utils/color"
import BaseModel from "../model"

const TYPES = {
	Point: 'point',
	Directional: 'directional',
	Spot: 'spot'
};

class Light extends BaseModel {
	constructor(options = {}) {
		super(options);
		this._color = options.color || Color.white();
		this._intensity = options.intensity !== undefined ? options.intensity : 1.0;
		this._position = vec3();
		this._direction = vec3(0, -1, 0);
		this._type = null;
	}

	get type() { return this._type; }

	get color() { return this._color; }
	set color(value) {
		this._color = value;
		this.trigger('modelUpdated', "color", value);
	}

	get intensity() { return this._intensity; }
	set intensity(value) {
		this._intensity = value;
		this.trigger('modelUpdated', "intensity", value);
	}

	get position() { return this._position; }
	set position(v) {
		this._position = v;
		this.trigger('modelUpdated', "position", v);
	}

	get direction() { return this._direction; }
	set direction(v) {
		this._direction = v;
		this.trigger('modelUpdated', "direction", v);
	}

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