import BaseModel from "../models/model"

class SceneModel extends BaseModel {

	constructor(options={}) {
		super(options);

		this._objects = new Map(); // Map of modelIdCounter to object model
	}

	addObject(object) {
		if (this._objects.has(object.id)) {
			console.warn(`Object with id ${object.id} already exists in the scene model. It will be overwritten.`);
		}
		this._objects.set(object.id, object);

		// TODO: here ? or in meshdrawable subscribe to model changes and trigger to sceneview
		// object.on('update', () => {
		// 	this.trigger('objectUpdated', object);
		// });
		this.trigger('objectAdded', object);
	}

	getObject(id) {
		return this._objects.get(id);
	}

	removeObject(id) {
		this._objects.delete(id);
		this.trigger('objectRemoved', id);
	}
}

export default SceneModel;