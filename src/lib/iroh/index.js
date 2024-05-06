import { Iroh } from 'public/thirdparty/iroh.js';
import { getSubstring, isEventConsoleLog } from '../utils';

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
		this.#queueElementIndex++;
		return this.#queueElementIndex < this.#queue.length
			? this.#queue[this.#queueElementIndex]
			: null;
	}

	getPrevQueueElement() {
		this.#queueElementIndex--;
		return this.#queueElementIndex >= 0
			? this.#queue[this.#queueElementIndex]
			: null;
	}

	push(e, eventContent) {
		const textContent =
			eventContent || getSubstring(this.#input, e.getLocation());
		this.#queue.push({ data: e, textContent });
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
		this.stage.addListener(Iroh.IF).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e));

		// else
		this.stage.addListener(Iroh.ELSE).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e));

		// loop
		this.stage.addListener(Iroh.LOOP).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e));

		// break
		this.stage.addListener(Iroh.BREAK).on('fire', (e) => this.push(e));

		// continue
		this.stage.addListener(Iroh.CONTINUE).on('fire', (e) => this.push(e));

		// switch
		this.stage.addListener(Iroh.SWITCH).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e));

		// case, default
		this.stage.addListener(Iroh.CASE).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e));

		// function call
		this.stage.addListener(Iroh.CALL).on('before', (e) => {
			if (isEventConsoleLog(e)) {
				this.push(e, e.arguments);
			} else {
				this.push(e);
			}
		});
		// .on('after', (e) => this.push(e));

		// function
		this.stage.addListener(Iroh.FUNCTION).on('enter', (e) => this.push(e));
		// .on('leave', (e) => this.push(e))
		// .on('return', (e) => this.push(e));

		// variable
		this.stage.addListener(Iroh.VAR).on('before', (e) => this.push(e));
		// .on('after', (e) => this.push(e));

		// new
		this.stage.addListener(Iroh.OP_NEW).on('before', (e) => this.push(e));
		// .on('after', (e) => this.push(e));

		// try
		this.stage.addListener(Iroh.TRY).on('before', (e) => this.push(e));
		// .on('after', (e) => this.push(e));

		// allocation
		this.stage.addListener(Iroh.ALLOC).on('fire', (e) => this.push(e));

		// member
		// this.stage.addListener(Iroh.MEMBER).on('fire', (e) => this.push(e));

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
		// this.stage
		// 	.addListener(Iroh.PROGRAM)
		// 	.on('enter', (e) => this.push(e))
		// 	.on('leave', (e) => this.push(e));
	}
}
