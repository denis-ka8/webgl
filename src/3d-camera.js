// import Renderer from "./renderer/renderer";
import CubeRenderer from "./renderer/cubeRenderer";

const main = async () => {
	const canvas = document.querySelector("#canvas");
	if (!canvas) return;

	// const renderer = new Renderer(canvas);
	const renderer = new CubeRenderer(canvas);
	renderer.startAnimation();
};

export { main };
