class NotFoundError extends Error {
	constructor(msg) {
		super(msg);
		this.name = this.constructor.name;
		this.status = 404;

		Error.captureStackTrace(this, this.constructor);
	}
}

class BadRequestError extends Error {
	constructor(msg) {
		super(msg);
		this.name = this.constructor.name;
		this.status = 400;

		Error.captureStackTrace(this, this.constructor);
	}
}

class InternalError extends Error {
	constructor(msg) {
		super(msg);
		this.name = this.constructor.name;
		this.status = 500;

		Error.captureStackTrace(this, this.constructor);
	}
}

class GenericError extends Error {
	constructor(msg, status = 500) {
		super(msg);
		this.name = this.constructor.name;
		this.status = status;

		Error.captureStackTrace(this, this.constructor);
	}
}

module.exports = {
	NotFoundError,
	BadRequestError,
	InternalError,
	GenericError
}