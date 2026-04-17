import { m4 } from "../../math/m4"; // TODO: remove
import { Vec3, vec3 } from "../../math/vec3";
import MathConverter from "../../math/converter";
import BaseModel, { BaseModelOptions } from "../model";

export interface CameraOptions extends BaseModelOptions {
    position?: Vec3;
    target?: Vec3;
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    xAngle?: number;
    yAngle?: number;
}

export interface ICamera {
    readonly position: Vec3;
    readonly target: Vec3;
    fov: number;
    aspect: number;
    near: number;
    far: number;
    xAngle: number;
    yAngle: number;

    getViewMatrix(): number[];
    getProjectionMatrix(): number[];
    getViewProjectionMatrix(): number[];
    getForwardVector(): Vec3;
    getRightVector(): Vec3;
    getUpVector(): Vec3;
}

export abstract class AbstractCamera extends BaseModel implements ICamera {
    protected _position: Vec3;
    protected _target: Vec3;
    protected _fov: number;
    protected _aspect: number;
    protected _near: number;
    protected _far: number;
    protected _xAngle: number;
    protected _yAngle: number;
    protected _xAngleRad: number;
    protected _yAngleRad: number;

    constructor(options: CameraOptions = {}) {
        super(options)
        this._position = options.position || vec3(1, 1, 1);
        this._target = options.target || vec3(0, 0, 0);
        this.fov = options.fov ?? 60;
        this.aspect = options.aspect ?? 1;
        this.near = options.near ?? 0.1;
        this.far = options.far ?? 10000;
        this.xAngle = options.xAngle ?? 0;
        this.yAngle = options.yAngle ?? 0;
    }

    get position(): Vec3 { return this._position; }
    set position(v: Vec3) {
        this._position = v;
    }

    get target(): Vec3 { return this._target; }
    set target(v: Vec3) {
        this._target = v;
    }

    get fov(): number { return this._fov; }
    set fov(value: number) {
        if (value <= 0 || value > 179)
            throw new Error("FOV must be between 0 and 179 degrees");
        this._fov = value;
    }

    get aspect(): number { return this._aspect; }
    set aspect(value: number) {
        if (value <= 0)
            throw new Error("Aspect ratio must be positive");
        this._aspect = value;
    }

    get near(): number { return this._near; }
    set near(value: number) {
        if (value <= 0)
            throw new Error("Near plane must be positive");
        if (value >= this._far)
            throw new Error("Near plane must be less than far plane");
        this._near = value;
    }

    get far(): number { return this._far; }
    set far(value: number) {
        if (value <= 0)
            throw new Error("Far plane must be positive");
        if (value <= this._near)
            throw new Error("Far plane must be greater than near plane");
        this._far = value;
    }

    get xAngle(): number { return this._xAngle; }
    set xAngle(value: number) {
        this._xAngle = this._normalizeAngle(value);
        this._xAngleRad = MathConverter.degreesToRadians(this._xAngle);
    }

    get yAngle(): number { return this._yAngle; }
    set yAngle(value: number) {
        this._yAngle = Math.max(-89, Math.min(89, this._normalizeAngle(value)));
        this._yAngleRad = MathConverter.degreesToRadians(this._yAngle);
    }

    abstract getViewMatrix(): number[];
    abstract getProjectionMatrix(): number[];

    getViewProjectionMatrix(): number[] {
        return m4.multiply(this.getProjectionMatrix(), this.getViewMatrix());
    }

    getForwardVector(): Vec3 {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);
		const cosY = Math.cos(this._yAngleRad);
		const sinY = Math.sin(this._yAngleRad);

		return vec3(
			sinX * cosY,
			-sinY,
			cosX * cosY
		);
    }

    getRightVector(): Vec3 {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);

		return vec3(
			cosX,
			0,
			-sinX
		);
    }

    getUpVector(): Vec3 {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);
		const cosY = Math.cos(this._yAngleRad);
		const sinY = Math.sin(this._yAngleRad);

		return vec3(
			sinX * sinY,
			cosY,
			cosX * sinY
		);
    }

    private _normalizeAngle(angle: number): number {
		angle = angle % 360;
		if (angle < -180) angle += 360;
		if (angle > 180) angle -= 360;
		return angle;
    }
}