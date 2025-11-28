import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { cancelationTokenType } from './cancelation-token'
import { ICardStage, ICardStageCtor } from './i-card-stage'

export interface ICityStage {
	go(
		driver: DriverExtention,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		regionNumber: number | undefined,
		cityNumber: number | undefined,
		cancelationToken: cancelationTokenType
	): Promise<void>
}

export interface ICityStageCtor {
	new (cardStage: ICardStage, logger: Logger): ICityStage
}
