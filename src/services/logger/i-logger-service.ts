export const enum logStateEnum {
	error,
	warning,
	default,
}

export type statesType = Record<logStateEnum, string>

export interface ILoggerService {
	log(message: string, state?: logStateEnum): void
}
