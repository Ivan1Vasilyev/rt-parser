import { cancelationTokenType } from './cancelation-token'

export interface IRootStage {
	name: rootStageNamesEnum
	cancelationToken: cancelationTokenType
	go(regionNumber?: number | undefined, cityNumber?: number | undefined): Promise<void>
	restart(regionNumber?: number | undefined, cityNumber?: number | undefined): void
	start(regionNumber?: number | undefined, cityNumber?: number | undefined): void
	stop(): void
}

export enum rootStageNamesEnum {
	main = 'main',
	internet = 'internet',
	rancho = 'rancho',
	cities = 'cities',
}
