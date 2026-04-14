import SceneManager from "./scene/sceneManager";

const main = async () => {
	const canvas = document.querySelector("#canvas");
	if (!canvas) return;

	const sceneManager = new SceneManager(canvas);
	sceneManager.initialize();
	sceneManager.start();

	window.addEventListener('resize', () => {
		sceneManager.resize(window.innerWidth, window.innerHeight);
	});
	sceneManager.resize(window.innerWidth, window.innerHeight);
};

export { main };
