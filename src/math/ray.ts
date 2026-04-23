import { Vec3, vec3 } from "./vec3";

class Ray {

    public _origin: Vec3;
    public _direction: Vec3;

    constructor(origin: Vec3, direction: Vec3) {
        this._origin = origin.copy();
        this._direction = direction.copy().normalize();
    }

    get origin(): Vec3 {
        return this._origin;
    }

    get direction(): Vec3 {
        return this._direction;
    }

    intersectSphere(center: Vec3, radius: number): number | null {
        // Вектор от начала луча до центра сферы
        // const L = Vec3.subtract(vec3(), center, this._origin);
        const L = Vec3.subtract(center, this._origin);

        // Проекция L на направление луча (скалярное произведение)
        // const tca = vec3.dot(L, this.direction);
        const tca = L.copy().dot(this._direction);

        // Если проекция отрицательна, сфера за лучом
        if (tca < 0) return null;

        // Квадрат расстояния от начала луча до проекции центра сферы на луч
        const d2 = L.copy().dot(L) - tca * tca;

        // Если это расстояние больше радиуса, луч не пересекает сферу
        if (d2 > radius * radius) return null;

        // Расстояние от проекции до точки пересечения
        const thc = Math.sqrt(radius * radius - d2);

        // Расстояние до ближайшей точки пересечения
        const t0 = tca - thc;

        return t0;
    }
}

function ray(origin: Vec3, direction: Vec3): Ray {
	return new Ray(origin, direction);
}

export { Ray, ray };
