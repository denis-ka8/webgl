import BaseModel from "../models/model"

class SceneModel extends BaseModel {

	constructor(options={}) {
		super(options);

		this._objects = new Map();
	}

	addObject(id, object) {
		this._objects.set(id, object);
	}

	getObject(id) {
		return this._objects.get(id);
	}

	removeObject(id) {
		this._objects.delete(id);
	}
}

export default SceneModel;