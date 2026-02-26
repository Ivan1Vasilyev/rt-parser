import { rootStageNamesEnum, cancelationTokenType, startParamsType } from './root-stage-models'

export interface IRootStage {
	name: rootStageNamesEnum
	cancelationToken: cancelationTokenType
	go(regionNumber?: number | undefined, cityNumber?: number | undefined): Promise<void>
	restart(startParams: startParamsType): void
	start(startParams: startParamsType): void
	stop(): void
}
