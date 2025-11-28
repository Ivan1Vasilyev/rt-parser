import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { clusterNamesEnum } from '../../services/models/cluster'
import { cancelationTokenType } from './cancelation-token'
import { ICityStage } from './i-city-stage'

export interface IRegionStage {
	go(driver: DriverExtention, regionNumber: number | undefined, cityNumber: number | undefined, cancelationToken: cancelationTokenType): Promise<void>
}

export interface IRegionStageCtor {
	new (cityStage: ICityStage, logger: Logger, clustes: clusterNamesEnum[]): IRegionStage
}
