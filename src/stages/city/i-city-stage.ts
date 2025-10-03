import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { ICardStage, ICardStageCtor } from '../card/i-card-stage'

export interface ICityStage {
	go(driver: DriverExtention, citiesLength: number, regionName: string, i: number, regionNumber: number | undefined, cityNumber: number | undefined): Promise<void>
}

export interface ICityStageCtor {
	new (cardStage: ICardStage, logger: Logger): ICityStage
}
