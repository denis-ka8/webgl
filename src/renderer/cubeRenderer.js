class CubeRenderer extends GLRenderer {

	constructor(canvas, options = {}) {
		super(canvas, options);
	}

	render() {
		super.render(this._scene, this._camera);
	}

	startAnimation() {
		const animate = (time) => {
			this.render();
			requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}
}

export default CubeRenderer;