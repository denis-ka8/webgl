import EventEmitter from "../utils/eventEmitter";

let modelIdCounter = 0;

export interface BaseModelOptions {
}

/**
 * BaseModel is a base class for all models in the application.
 * It provides basic functionality for tracking changes and applying them to the model.
 */
class BaseModel extends EventEmitter {

	private _id: number;
	private _dirty: Record<string, boolean> = {};

	constructor(options: BaseModelOptions) {
		super();
		this._id = modelIdCounter++;
	}

	get id(): number {
		return this._id;
	}

	save(): void {
		// TODO: save changes as dirty
	}

	apply(): void {
		// TODO:
		// apply changes to the model, clear dirty flags
		// trigger model changed event, update views
	}
}

export default BaseModel;