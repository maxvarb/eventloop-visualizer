import { Iroh } from 'public/thirdparty/iroh.js';

import { getSubstring } from '../utils';

export class IrohRunner {
	stage;
	#input;

	#queue = [];
	#queueElementIndex = -1;

	constructor(input) {
		this.#input = input;
		try {
			this.stage = new Iroh.Stage(input);
			this.addStageListeners();
		} catch (e) {
			console.log('Error', e);
		}
	}

	getNextQueueElement() {
		if (this.#queueElementIndex < this.#queue.length - 1) {
			this.#queueElementIndex++;
			return this.#queue[this.#queueElementIndex];
		}
		this.#queueElementIndex = this.#queue.length;
		return null;
	}

	getPrevQueueElement() {
		if (this.#queueElementIndex > 0) {
			this.#queueElementIndex--;
			return this.#queue[this.#queueElementIndex];
		}
		this.#queueElementIndex = -1;
		return null;
	}

	push(e, isIgnored = false) {
		this.#queue.push({
			data: e,
			textContent: getSubstring(this.#input, e.getLocation()),
			isIgnored,
		});
	}

	reset() {
		this.#queue = [];
		this.#queueElementIndex = -1;
	}

	getQueue() {
		return this.#queue;
	}

	getCurrentQueueElementIndex() {
		return this.#queueElementIndex;
	}

	addStageListeners() {
		// if
		this.stage
			.addListener(Iroh.IF)
			.on('enter', (e) => this.push(e))
			.on('leave', (e) => this.push(e, true));

		// else
		this.stage
			.addListener(Iroh.ELSE)
			.on('enter', (e) => this.push(e))
			.on('leave', (e) => this.push(e, true));

		// loop
		this.stage
			.addListener(Iroh.LOOP)
			.on('enter', (e) => this.push(e, true))
			.on('leave', (e) => this.push(e));

		// break
		this.stage.addListener(Iroh.BREAK).on('fire', (e) => this.push(e));

		// continue
		this.stage.addListener(Iroh.CONTINUE).on('fire', (e) => this.push(e));

		// switch
		this.stage
			.addListener(Iroh.SWITCH)
			.on('enter', (e) => this.push(e))
			.on('leave', (e) => this.push(e, true));

		// case, default
		this.stage
			.addListener(Iroh.CASE)
			.on('enter', (e) => this.push(e))
			.on('leave', (e) => this.push(e, true));

		// function call
		this.stage
			.addListener(Iroh.CALL)
			.on('before', (e) => {
				this.push(e, true);
			})
			.on('after', (e) => this.push(e));

		// function
		this.stage
			.addListener(Iroh.FUNCTION)
			.on('enter', (e) => this.push(e))
			.on('leave', (e) => this.push(e, true))
			.on('return', (e) => this.push(e, true));

		// variable
		this.stage
			.addListener(Iroh.VAR)
			.on('before', (e) => this.push(e))
			.on('after', (e) => this.push(e, true));

		// new
		this.stage
			.addListener(Iroh.OP_NEW)
			.on('before', (e) => this.push(e))
			.on('after', (e) => this.push(e, true));

		// try
		this.stage
			.addListener(Iroh.TRY)
			.on('before', (e) => this.push(e))
			.on('after', (e) => this.push(e, true));

		// allocation
		this.stage.addListener(Iroh.ALLOC).on('fire', (e) => this.push(e));

		// member
		this.stage
			.addListener(Iroh.MEMBER)
			.on('fire', (e) => this.push(e, true));

		// this
		this.stage.addListener(Iroh.THIS).on('fire', (e) => this.push(e));

		// assignment
		this.stage.addListener(Iroh.ASSIGN).on('fire', (e) => this.push(e));

		// ternary
		this.stage.addListener(Iroh.TERNARY).on('fire', (e) => this.push(e));

		// logical
		this.stage.addListener(Iroh.LOGICAL).on('fire', (e) => this.push(e));

		// binary
		this.stage.addListener(Iroh.BINARY).on('fire', (e) => this.push(e));

		// unary
		this.stage.addListener(Iroh.UNARY).on('fire', (e) => this.push(e));

		// update
		this.stage.addListener(Iroh.UPDATE).on('fire', (e) => this.push(e));

		// program
		this.stage
			.addListener(Iroh.PROGRAM)
			.on('enter', (e) => this.push(e, true))
			.on('leave', (e) => this.push(e, true));
	}
}
