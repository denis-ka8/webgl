import PointLight from "./pointLight"
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class SpotLight extends PointLight {
	constructor(
		color = Color.white(),
		intensity = 1.0,
		position = vec3(0, 5, 0),
		range = 10.0,
		direction = vec3(0, -1, 0),
		angle = 45,
		penumbra = 0.1
	) {
		super(color, intensity, position, range);
		this._direction = direction;
		this._angle = angle; // угол конуса света в градусах
		this._penumbra = penumbra; // степень размытия тени
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = Light.Types.Spot;
		data.angle = this._angle;
		data.penumbra = this._penumbra;
		return data;
	}
}

export default SpotLight;