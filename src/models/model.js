/**
 * BaseModel is a base class for all models in the application.
 * It provides basic functionality for tracking changes and applying them to the model.
 */
class BaseModel {
	constructor(options={}) {
		this._dirty = {};
	}

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