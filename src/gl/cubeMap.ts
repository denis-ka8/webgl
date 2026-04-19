import Resource, { ResourceOptions, WebGLResourceId } from "./resource";
import Texture from "./texture";

export enum CubeMapFace {
    POSITIVE_X = 0, // right
    NEGATIVE_X = 1, // left
    POSITIVE_Y = 2, // top
    NEGATIVE_Y = 3, // bottom
    POSITIVE_Z = 4, // back
    NEGATIVE_Z = 5  // front
}

class CubeMap extends Resource {

    private _faces: (Texture | null)[];

    constructor(options: ResourceOptions) {
        super(options);
        this._faces = [null, null, null, null, null, null];
    }

    setFace(face: CubeMapFace, texture: Texture): void {
        this._faces[face] = texture;
    }

    create(): WebGLTexture | null {
        const gl = this._glContext;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        for (let i = 0; i < 6; i++) {
            const face = this._faces[i];
            if (face && face.isValid()) {
                const target = this._getFaceTarget(i);
                gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, face.getImage()!);
            }
        }

        this._setupParameters();
		this.setId(texture);
        return texture;
    }

    private _getFaceTarget(index: number): number {
        const gl = this._glContext;
        const targets: number[] = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        return targets[index]!;
    }

    private _setupParameters(): void {
        const gl = this._glContext;
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }

    protected _destroyGLResource(resource: WebGLResourceId): void {
        const gl = this._glContext;
        gl.deleteTexture(resource);
    }
}

export default CubeMap;