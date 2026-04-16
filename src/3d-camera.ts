import SceneManager from "./scene/sceneManager";

const main = async (): Promise<void> => {
	const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null;
	if (!canvas) {
		console.warn("Canvas element not found");
		return;
	}

	const sceneManager = new SceneManager(canvas);
	sceneManager.initialize();
	sceneManager.start();

	window.addEventListener("resize", () => {
		sceneManager.resize(window.innerWidth, window.innerHeight);
	});
	sceneManager.resize(window.innerWidth, window.innerHeight);
};

export { main };
