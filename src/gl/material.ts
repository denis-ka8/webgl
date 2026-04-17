/*
import Color from "../utils/color";
import Resource, { ResourceOptions } from "./resource";

// enum IOR {
// 	Glass = 1.5
// }

export type TextureSlot =
    | 'baseColor'
    | 'metallic'
    | 'roughness'
    | 'normal'
    | 'ao'
    | 'emissive'
    | 'height';

interface MaterialOptions extends ResourceOptions {
    baseColor?: Color;
    metallic?: number;
    roughness?: number;
    // alpha?: number;
    // transparent?: boolean;
    // emissiveColor?: Color;
    // emissiveIntensity?: number;
    // ior?: number;
    // sss?: number;
}

export interface IMaterial {
    setTexture(slot: TextureSlot, texture: WebGLTexture | null): void;
    getTexture(slot: TextureSlot): WebGLTexture | null;

    emissiveIntensity: number;
    normalScale: number;
    aoIntensity: number;
}

class Material extends Resource implements IMaterial {

    // PBR
    private _baseColor = Color.white();
    private _metallic = 0.0;
    private _roughness = 0.5;

    // Extend PBR
    // private _alpha = 1.0;
    // private _transparent = false;
    // private _emissiveColor = Color.black();
    // private _emissiveIntensity = 0.0;

    // Effects
    // private _ior = IOR.Glass;               // Index of Refraction - показатель преломления
    // private _sss = null;                    // Subsurface Scattering - подповерхностное рассеивание

	constructor(options: MaterialOptions) {
		super(options);
	}

    get baseColor(): Color {
        return this._baseColor;
    }
    set baseColor(color: Color) {
        this._baseColor = color;
    }

    get metallic(): number {
        return this._metallic;
    }
    set metallic(value: number) {
        this._metallic = value;
    }

    get roughness(): number {
        return this._roughness;
    }
    set roughness(value: number) {
        this._roughness = value;
    }

    initialize(gl) {
        // Инициализация текстур, если они есть
        Object.values(this._textures).forEach(texture => {
        if (texture && !texture.isInitialized()) {
        texture.initialize(gl);
        }
        });
        this._initialized = true;
    }

    dispose(gl) {
        // Освобождаем текстуры
        Object.values(this._textures).forEach(texture => {
        if (texture) texture.dispose(gl);
        });
        this._initialized = false;
    }

    update(gl) {
        if (this.isDirty()) {
            // Переинициализируем при необходимости
            this.initialize(gl);
            this.clearDirty();
        }
    }
}

export default Material;
*/