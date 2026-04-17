import BaseModel, { BaseModelOptions } from "../models/model";
import Light from "../models/light/light";
import DirectionalLight from "../models/light/directionalLight";
import PointLight from "../models/light/pointLight";
import SpotLight from "../models/light/spotLight";
import Camera from "../models/camera/camera";

type LightType = DirectionalLight | PointLight | SpotLight;

interface SceneModelOptions extends BaseModelOptions {}

class SceneModel extends BaseModel {

	// Map of modelIdCounter to model instance
	private _objects: Map<number, BaseModel> = new Map();
	private _lights: Map<number, LightType> = new Map();
	private _cameras: Map<number, Camera> = new Map();

	constructor(options: SceneModelOptions = {}) {
		super(options);
	}

	// Objects
	addObject(object: BaseModel): void {
		if (this._objects.has(object.id)) {
			console.warn(`Object with id ${object.id} already exists in the scene model. It will be overwritten.`);
		}
		this._objects.set(object.id, object);
		this.trigger('objectAdded', object);
	}

	getObject(id: number): BaseModel | undefined {
		return this._objects.get(id);
	}

	removeObject(id: number): void {
		this._objects.delete(id);
		this.trigger('objectRemoved', id);
	}

	// Lights
	addLight(light: LightType): void {
		if (this._lights.has(light.id)) {
			console.warn(`Light with id ${light.id} already exists in the scene model. It will be overwritten.`);
		}
		this._lights.set(light.id, light);
		this.trigger('lightAdded', light);
	}

	getLight(id: number): LightType | undefined {
		return this._lights.get(id);
	}

	getLights(): LightType[] {
		return Array.from(this._lights.values());
	}

	removeLight(id: number): void {
		this._lights.delete(id);
		this.trigger('lightRemoved', id);
	}

	// Cameras
	addCamera(camera: Camera): void {
		if (this._cameras.has(camera.id)) {
			console.warn(`Camera with id ${camera.id} already exists in the scene model. It will be overwritten.`);
		}
		this._cameras.set(camera.id, camera);
		this.trigger('cameraAdded', camera);
	}

	getCamera(id: number): Camera | undefined {
		return this._cameras.get(id);
	}

	removeCamera(id: number): void {
		this._cameras.delete(id);
		this.trigger('cameraRemoved', id);
	}
}

export default SceneModel;