import GizmosDrawable from "../drawables/gizmosDrawable";
import MeshDrawable from "../drawables/meshDrawable";
import GizmosModel from "../models/gizmosModel";
import MeshModel from "../models/meshModel";
import EventEmitter from "../utils/eventEmitter";

class GizmosController extends EventEmitter {

    private _activeGizmo: GizmosDrawable | null = null;
    private _targetModel: MeshModel | null = null;

    constructor() {
        super();
    }

    activateFor(drawable: MeshDrawable): void {
        this._targetModel = drawable.model as MeshModel;

        if (this._activeGizmo) {
            const gizmosModel = this._activeGizmo.model as GizmosModel;
            if (gizmosModel) gizmosModel.position = this._targetModel.position.copy();
            this._activeGizmo.visible = true;

            this.trigger("gizmoCreated", this._activeGizmo);
            return;
        }

        const gizmosModel = new GizmosModel({
            position: this._targetModel.position,
        });

        this._activeGizmo = new GizmosDrawable({ model: gizmosModel });

        this._setupMouseListeners();

        this.trigger("gizmoCreated", this._activeGizmo);
    }

    deactivate(): void {
        if (!this._activeGizmo) return;
        this._activeGizmo.visible = false;
    }

    _setupMouseListeners() {}
}

export default GizmosController;