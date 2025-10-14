import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { clusterConfigType } from '../../services/models/cluster'
import { ICityStage } from './i-city-stage'

export interface IRegionStage {
	go(driver: DriverExtention, regionNumber: number | undefined, cityNumber: number | undefined): Promise<void>
}

export interface IRegionStageCtor {
	new (cityStage: ICityStage, logger: Logger, clusterConfig: clusterConfigType): IRegionStage
}
