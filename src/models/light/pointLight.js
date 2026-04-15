import Light from './light';
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class PointLight extends Light {
	constructor(options = {}) {
		super(options);
		this._range = options.range !== undefined ? options.range : 10.0; // дальность затухания света
		this._type = Light.Types.Point;
	}

	get range() { return this._range; }
	set range(value) {
		this._range = value;
		this.trigger('modelUpdated', "range", value);
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = this._type;
		data.range = this._range;
		return data;
	}
}

export default PointLight;