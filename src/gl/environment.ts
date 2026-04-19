import CubeMap, { CubeMapFace } from "./cubeMap";
import Texture from "./texture";

export interface EnvironmentOptions {
	glContext: WebGLRenderingContext;
}

class Environment {

    private _cubeMap: CubeMap | null = null;
    private _intensity: number = 1.0;
	protected _glContext: WebGLRenderingContext;

    constructor(options: EnvironmentOptions) {
		if (!options.glContext)
			throw new Error("Environment::constructor()\n\WebGLRenderingContext is required to create environment");

        this._glContext = options.glContext;
    }

    async loadFromPaths(paths: string[]): Promise<CubeMap> {
        if (paths.length !== 6) {
            throw new Error('CubeMap requires exactly 6 paths');
        }

        const cubeMap = new CubeMap({ glContext: this._glContext });
        const faceTextures: Texture[] = [];

        for (const [index, path] of paths.entries()) {
            const texture = new Texture({ glContext: this._glContext });
            texture.create();
            await texture.loadFromUrl(path);
            faceTextures.push(texture);
        }

        faceTextures.forEach((texture, index: CubeMapFace) => {
            cubeMap.setFace(index, texture);
        });

        cubeMap.create();
        this._cubeMap = cubeMap;
        return cubeMap;
    }

    getCubeMap(): CubeMap | null {
        return this._cubeMap;
    }

    getIntensity(): number {
        return this._intensity;
    }

    setIntensity(intensity: number): void {
        this._intensity = intensity;
    }
}

export default Environment;