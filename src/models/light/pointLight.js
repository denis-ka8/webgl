import Light from './light';
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class PointLight extends Light {
	constructor(
		color = Color.white(),
		intensity = 1.0,
		position = vec3(0, 5, 0),
		range = 10.0
	) {
		super(color, intensity);
		this._position = position;
		this._range = range; // дальность затухания света
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = Light.Types.Point;
		data.range = this._range;
		return data;
	}
}

export default PointLight;