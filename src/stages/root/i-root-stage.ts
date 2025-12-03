export interface IRootStage {
	name: rootStageNamesEnum
	cancelationToken: cancelationTokenType
	go(regionNumber?: number | undefined, cityNumber?: number | undefined): Promise<void>
	restart(startParams: startParamsType): void
	start(startParams: startParamsType): void
	stop(): void
}

export type startParamsType = {
	regionNumber?: number | undefined
	cityNumber?: number | undefined
}

export type cancelationTokenType = { isInterrupted: Boolean }

export enum rootStageNamesEnum {
	main = 'main',
	internet = 'internet',
	rancho = 'rancho',
	cities = 'cities',
}

export const isRootStageName = (value: string): value is rootStageNamesEnum => value in rootStageNamesEnum
