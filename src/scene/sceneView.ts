
import CameraController from "../controllers/cameraController";
import Drawable from "../drawables/drawable";
import CubeDrawable from "../drawables/mesh/cubeDrawable";
import Light from "../models/light/light";
import DirectionalLight from "../models/light/directionalLight";
import PointLight from "../models/light/pointLight";
import SpotLight from "../models/light/spotLight";
import Camera from "../models/camera/camera";
import BaseModel from "../models/model";
import MeshModel from "../models/meshModel";
import Color from "../utils/color";
import CubeRenderer from "../renderer/cubeRenderer";
import GizmosRenderer from "../renderer/gizmosRenderer";
import { vec3, Vec3 } from "../math/vec3";
import { Ray } from "../math/ray";
import { m4 } from "../math/m4";
import GizmosDrawable from "../drawables/gizmosDrawable";

const AMBIENT_LIGHT = {
	color: Color.white().toRGBArray(),
	intensity: 0.35,
}

type LightType = DirectionalLight | PointLight | SpotLight;

// TODO: TMP! REFAC!
type Vec4 = [number, number, number, number];
type Mat4 = [
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number
];

/**
 * SceneView is responsible for managing the camera and the list of drawables in the scene.
 * It also handles resizing and updating the view.
 */
class SceneView {

	private _sceneModel: BaseModel;
	private _renderer: CubeRenderer;
	private _gizmosRenderer: GizmosRenderer | null = null;
	private _glContext: WebGLRenderingContext;
	private _cameraController: CameraController | null = null;
	private _drawableObjects: Map<number, Drawable> = new Map(); // Map of modelId to drawable object
	private _pendingUpdates: Set<number> = new Set(); // Set of modelId that need to be updated
	private _pendingAdditions: Set<number> = new Set(); // Set of modelId that need to be added
	private _pendingRemovals: Set<number> = new Set(); // Set of modelId that need to be removed
	private _lightUniforms: Record<string, any> = {};
	private _cameraUniforms: Record<string, any> = {};

	constructor(sceneModel: BaseModel, renderer: CubeRenderer, /*gizmosRenderer: GizmosRenderer, */glContext: WebGLRenderingContext) {
		this._sceneModel = sceneModel;
		this._renderer = renderer;
		// this._gizmosRenderer = gizmosRenderer;
		this._glContext = glContext;

		this._sceneModel.on('objectAdded', this._onObjectAdded.bind(this));
		this._sceneModel.on('objectRemoved', this._onObjectRemoved.bind(this));
		this._sceneModel.on('cameraAdded', this._onCameraAdded.bind(this));
		this._sceneModel.on('cameraRemoved', this._onCameraRemoved.bind(this));
		this._sceneModel.on('lightAdded', this._onLightAdded.bind(this));
		this._sceneModel.on('lightRemoved', this._onLightRemoved.bind(this));

		this._drawableObjects = new Map(); // Map of modelIdCounter to drawable object

		// TODO: wip
		this._pendingUpdates = new Set(); // Set of modelIdCounter that need to be updated
		this._pendingAdditions = new Set(); // Set of modelIdCounter that need to be added
		this._pendingRemovals = new Set(); // Set of modelIdCounter that need to be removed

		this._lightUniforms = {};
		this._cameraUniforms = {};
	}

	destructor(): void {
		// TODO:
		// this._cameraController.destructor();
	}

	get model(): BaseModel { return this._sceneModel; }

	addGizmosRenderer(gizmosRenderer: GizmosRenderer): void {
		this._gizmosRenderer = gizmosRenderer;
		if (!this._cameraController) return;

		const camera: Camera = this._cameraController.camera
		this._gizmosRenderer.setCamera(camera);
		this._gizmosRenderer.updateCameraUniforms(this._cameraUniforms);
		this._gizmosRenderer.updateCameraPosition(camera.position);
	}

	addGizmosDrawable(gizmosDrawable: GizmosDrawable): void {
		if (!this._gizmosRenderer) return;
		this._gizmosRenderer.addGizmos(gizmosDrawable);
	}

	_initializeCameraController(camera: Camera): void {
		this._cameraController = new CameraController(
			camera,
			this._glContext,
			{ cameraSpeed: 50 }
		);
		this._cameraController.on("change", (camera: Camera) => {
			this._cameraUniforms = {
				uProjectionMatrix: camera.getProjectionMatrix(),
				uViewMatrix: camera.getViewMatrix(),
			};
			if (this._renderer) {
				this._renderer.updateCameraUniforms(this._cameraUniforms);
				this._renderer.updateCameraPosition(camera.position);
			}
			if (this._gizmosRenderer) {
				this._gizmosRenderer.updateCameraUniforms(this._cameraUniforms);
				this._gizmosRenderer.updateCameraPosition(camera.position);
			}
		});
		this._cameraController.listen();

		this._renderer.setCamera(camera);
	}

	_createDrawable(model: BaseModel): number | null {
		let drawable: Drawable | null = null;
		switch (model.constructor.name) {
			case 'CubeModel':
				drawable = new CubeDrawable({ model });
				break;
			default:
				console.warn(`Unknown model type ${model.constructor.name} added to the scene model. It will not be rendered.`);
		}
		if (drawable) {
			this._drawableObjects.set(model.id, drawable);
			return model.id;
		}
		return null;
	}

	// Scene model event handlers
	_onObjectAdded(object: BaseModel): void {
		object.on("modelUpdated", (param: string, value: any) => {
			this._onObjectUpdated(object, param, value);
		});
		const id = this._createDrawable(object);
		if (id !== null) {
			this._pendingAdditions.add(object.id);
		}
	}

	_onObjectUpdated(object: BaseModel, param: string, value: any): void {
	// 	this._pendingUpdates.add(object.id);
	}

	_onObjectRemoved(object: BaseModel): void {
		// object.off("modelUpdated");
		this._pendingRemovals.add(object.id);
	}

	_onCameraAdded(camera: Camera): void {
		// TODO: one active camera at a time for now
		this._initializeCameraController(camera);
	}

	// _onCameraUpdated(camera: Camera): void {}

	_onCameraRemoved(camera: Camera): void {}
	
	_onLightAdded(light: LightType): void {
		light.on("modelUpdated", (param: string, value: any) => {
			this._onLightUpdated(param, value);
		});

		const lightData = light.getUniformData();
		const directionalColor = lightData.color.toRGBArray();
		const direction = ("direction" in lightData) ? Vec3.normalize(lightData.direction) : vec3();
		const directionalIntensity = lightData.intensity;

		this._lightUniforms = {
			uAmbientLightColor: AMBIENT_LIGHT.color,
			uAmbientLightIntensity: AMBIENT_LIGHT.intensity,
			uDirectionalLightColor: directionalColor,
			uDirectionalLightDirection: direction,
			uDirectionalLightIntensity: directionalIntensity
		};
		this._renderer.updateLightUniforms(this._lightUniforms);
	}

	_onLightUpdated(param: string, value: any): void {
		let uniformsUpdated = true;
		switch (param) {
			case "direction":
				this._lightUniforms.uDirectionalLightDirection = Vec3.normalize(value);
				break;
			// TODO: handle other light parameters
			default:
				uniformsUpdated = false;
				break;
		}
		if (uniformsUpdated) {
			this._renderer.updateLightUniforms(this._lightUniforms);
		}
	}

	_onLightRemoved(light: Light): void {
		// light.off("modelUpdated");
	}

	_prepareObjectsDiff(): {
		additions: Drawable[];
		updates: Drawable[];
		removals: Drawable[];
	} {
		return {
			additions: Array.from(this._pendingAdditions)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
			updates: Array.from(this._pendingUpdates)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
			removals: Array.from(this._pendingRemovals)
				.map(id => this._drawableObjects.get(id))
				.filter((obj): obj is Drawable => obj !== undefined),
		};
	}

	_clearPending(): void {
		this._pendingAdditions.clear();
		this._pendingUpdates.clear();
		this._pendingRemovals.clear();
	}

	update(): void {
		const objectsDiff = this._prepareObjectsDiff();
		this._clearPending();

		this._renderer.updateSceneObjects(objectsDiff);
		this._renderer.render();

		if (this._gizmosRenderer) this._gizmosRenderer.render();
	}

	resize(width: number, height: number): void {
		this._glContext.canvas.width = width;
		this._glContext.canvas.height = height;
		this._renderer.setSize(width, height);
		if (this._gizmosRenderer) this._gizmosRenderer.setSize(width, height);
		if (this._cameraController) {
			this._cameraUniforms = {
				uProjectionMatrix: this._cameraController.camera.getProjectionMatrix(),
				uViewMatrix: this._cameraController.camera.getViewMatrix(),
			};
			if (this._renderer) this._renderer.updateCameraUniforms(this._cameraUniforms);
			if (this._gizmosRenderer) this._gizmosRenderer.updateCameraUniforms(this._cameraUniforms);
		}
	}

	pickObject(x: number, y: number): Drawable | null {
        const ray = this._createRayFromScreen(x, y);

        let closestObject: Drawable | null = null;
        let closestDistance = Infinity;

        for (const drawable of this._drawableObjects.values()) {
			if (!drawable.model) continue;
			const model = drawable.model as MeshModel;
            const distance = ray.intersectSphere(model.position, 1);
            if (distance !== null && distance < closestDistance) {
                closestDistance = distance;
                closestObject = drawable;
            }
        }

        return closestObject;
	}

	// TODO: TMP! REFAC!
    private _createRayFromScreen(screenX: number, screenY: number): Ray {
        const gl = this._glContext;
        const canvas = gl.canvas as HTMLCanvasElement;

        // Нормализуем координаты в диапазон [-1, 1]
        const normalizedX = (screenX / canvas.width) * 2 - 1;
        const normalizedY = 1 - (screenY / canvas.height) * 2; // Инвертируем Y

        // Создаём точки на ближней и дальней плоскостях
        const nearPoint = this._unproject(normalizedX, normalizedY, 0);
        const farPoint = this._unproject(normalizedX, normalizedY, 1);

        // Направление луча
        const direction = Vec3.subtract(farPoint, nearPoint);
		direction.normalize();

        return new Ray(nearPoint, direction);
    }

    private _unproject(x: number, y: number, z: number): Vec3 {
		if (!this._cameraController) return vec3();

		const camera: Camera = this._cameraController.camera;
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        // Объединяем матрицы
        const mvp = m4.multiply(projectionMatrix, viewMatrix);
        const invMvp = m4.inverse(mvp) as Mat4;

        // Преобразуем нормализованные координаты в мировые
        const clip = [x, y, z, 1] as Vec4;
        const world = this._transformMat4(clip, invMvp);

		// Perspective divide
		if (world[3] !== 0 && Math.abs(world[3]) > 1e-6) {
			const w = world[3];
			world[0] /= w;
			world[1] /= w;
			world[2] /= w;
		}

		return vec3(world[0], world[1], world[2]);
    }

    private _transformMat4(a: Vec4, m: Mat4): Vec4 {
		const [x, y, z, w] = a;

        return [
            m[0] * x + m[4] * y + m[8] * z + m[12] * w,
            m[1] * x + m[5] * y + m[9] * z + m[13] * w,
            m[2] * x + m[6] * y + m[10] * z + m[14] * w,
            m[3] * x + m[7] * y + m[11] * z + m[15] * w
        ];
    }
}

export default SceneView;