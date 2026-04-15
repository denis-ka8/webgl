import PointLight from "./pointLight"
import Color from "../../utils/color"
import { vec3 } from "../../math/vec3"

class SpotLight extends PointLight {
	constructor(options = {}) {
		super(options);
		this._angle = options.angle !== undefined ? options.angle : 45; // угол конуса света в градусах
		this._penumbra = options.penumbra !== undefined ? options.penumbra : 0.1; // степень размытия тени
		this._type = Light.Types.Spot;
	}

	get angle() { return this._angle; }
	set angle(value) {
		this._angle = value;
		this.trigger('modelUpdated', "angle", value);
	}

	get penumbra() { return this._penumbra; }
	set penumbra(value) {
		this._penumbra = value;
		this.trigger('modelUpdated', "penumbra", value);
	}

	getUniformData() {
		const data = super.getUniformData();
		data.type = this._type;
		data.angle = this._angle;
		data.penumbra = this._penumbra;
		return data;
	}
}

export default SpotLight;