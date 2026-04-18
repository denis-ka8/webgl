import Color from "../utils/color";
import Resource, { ResourceOptions, WebGLResourceId } from "./resource";
import Texture from "./texture";

export enum IOR {
    Air = 1.0,
    Water = 1.33,
	Glass = 1.5,
    Diamond = 2.4
}

export type TextureSlot =
    | "baseColor"
    | "metallic"
    | "roughness"
    | "normal"
    | "ao"
    | "emissive"
    | "height";

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

class Material extends Resource {

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

    // Textures
    private _textures: Record<TextureSlot, Texture | null> = {
        baseColor: null,
        metallic: null,
        roughness: null,
        normal: null,
        ao: null,
        emissive: null,
        height: null
    };

	constructor(options: MaterialOptions) {
		super(options);

        if (options.baseColor) this._baseColor = options.baseColor;
        this._metallic = options.metallic ?? this._metallic;
        this._roughness = options.roughness ?? this._roughness;
	}

    getBaseColor(): Color {
        return this._baseColor;
    }
    setBaseColor(color: Color) {
        this._baseColor = color;
    }

    getMetallic(): number {
        return this._metallic;
    }
    setMetallic(value: number) {
        this._metallic = value;
    }

    getRoughness(): number {
        return this._roughness;
    }
    setRoughness(value: number) {
        this._roughness = value;
    }

    setTexture(slot: TextureSlot, texture: Texture): void {
        this._textures[slot] = texture;
    }

    getTexture(slot: TextureSlot): Texture | null {
        return this._textures[slot];
    }

    create(): WebGLResourceId | null {
        return null;
    }

    protected _destroyGLResource(resource: WebGLResourceId): void {
    }

    isValid(): boolean {
        const hasBaseColor = this._baseColor !== null;
        const hasTextures = Object.values(this._textures).some(texture => texture !== null && texture.isValid());

        return hasBaseColor || hasTextures;
    }

    dispose(): void {
        if (this._isDisposed) return;

        Object.values(this._textures).forEach(texture => {
            if (texture) texture.dispose();
        });
        super.dispose();
    }
}

export default Material;
