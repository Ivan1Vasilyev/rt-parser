import Logger from '../../services/logger/log-service'
import { clusterConfigType } from '../../services/models/cluster'
import { ICityStageCtor } from './i-city-stage'
import { IRegionStageCtor } from './i-region-stage'

export type citiesWayConfig = {
	path: string
	regionStageClass: IRegionStageCtor
	cityStageClass: ICityStageCtor
	logger: Logger
	clusterConfig: clusterConfigType
}
