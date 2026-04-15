import Light from "./light"
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class DirectionalLight extends Light {
	constructor(
		color = Color.white(),
		intensity = 1.0,
		direction = vec3(0, -1, 0)
	) {
		super(color, intensity);
		this._direction = direction;
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = Light.Types.Directional;
		return data;
	}
}

export default DirectionalLight;