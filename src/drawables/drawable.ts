import BaseModel from "../models/model";

export interface DrawableOptions {
	model?: BaseModel | null;
}

/**
 * Base class for drawable objects in the scene.
 * It holds a reference to a model, which contains the data needed for rendering.
 */
class Drawable {

	protected _model: BaseModel | null;
	private _visible: boolean = true;

	constructor(options: DrawableOptions = {}) {
		this._model = options.model ?? null;
	}

	get model(): BaseModel | null {
		return this._model;
	}

	set model(value: BaseModel | null) {
		this._model = value;
	}

	get visible(): boolean {
		return this._visible;
	}

	set visible(value: boolean) {
		this._visible = value;
	}
}

export default Drawable;