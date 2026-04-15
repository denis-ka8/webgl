import EventEmitter from "../utils/eventEmitter"

let modelIdCounter = 0;

/**
 * BaseModel is a base class for all models in the application.
 * It provides basic functionality for tracking changes and applying them to the model.
 */
class BaseModel extends EventEmitter {
	constructor(options={}) {
		super();
		this._id = modelIdCounter++;
		this._dirty = {};
	}

	get id() { return this._id; }

	save() {
		// TODO: save changes as dirty
	}

	apply() {
		// TODO:
		// apply changes to the model, clear dirty flags
		// trigger model changed event, update views
	}
}

export default BaseModel;