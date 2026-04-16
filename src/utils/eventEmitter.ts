class EventEmitter {

	private _events: { [eventName: string]: Function[] } = {};

	constructor() {}

	destructor(): void {}

	on(eventName: string, callback: Function): void {
		if (!this._events[eventName]) {
			this._events[eventName] = [];
		}
		this._events[eventName].push(callback);
	}

	off(eventName: string, callback: Function): void {
		const callbacks = this._events[eventName];
		if (!callbacks) return;

		const index = callbacks.indexOf(callback);
		if (index !== -1) {
			callbacks.splice(index, 1);
		}
	}

	emit(eventName: string, ...args: any[]): void {
		const callbacks = this._events[eventName];
		if (callbacks) {
			callbacks.forEach(callback => {
				callback.apply(this, args);
			});
		}
	}

	trigger(eventName: string, ...args: any[]): void {
		this.emit(eventName, ...args);
	}
}

export default EventEmitter;