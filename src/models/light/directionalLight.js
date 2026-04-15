import Light from "./light"
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class DirectionalLight extends Light {
	constructor(options = {}) {
		super(options);
		this._direction = options.direction || vec3(0, -1, 0);
		this._type = Light.Types.Directional;
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = this._type;
		return data;
	}
}

export default DirectionalLight;