import { IDriverService } from '../../services/driver/i-driver-service'
import { ILoggerService } from '../../services/logger/i-logger-service'
import { ICardStage } from '../card/i-card-stage'
import { cancelationTokenType, startParamsType } from '../root/root-stage-models'

export interface ICityStage {
	go(
		driver: IDriverService,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		cancelationToken: cancelationTokenType,
		startParams: startParamsType,
	): Promise<void>
}

export interface ICityStageCtor {
	new (cardStage: ICardStage, logger: ILoggerService): ICityStage
}
