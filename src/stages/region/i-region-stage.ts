import DriverExtention from '../../extentions/driver/driver-extention'
import { ClusterNamesType } from '../../services/cluster/cluster-service'
import Logger from '../../services/logger/log-service'
import { ICityStage } from '../city/i-city-stage'

export interface IRegionStage {
	go(driver: DriverExtention, regionsLength: number, regionNumber: number | undefined, cityNumber: number | undefined): Promise<void>
}

export interface IRegionStageCtor {
	new (cityStage: ICityStage, logger: Logger, clusterName: ClusterNamesType | undefined): IRegionStage
}
