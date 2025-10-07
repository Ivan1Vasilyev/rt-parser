import Logger from '../../services/logger/log-service'
import { clusterNamesEnum } from '../../services/models/cluster'
import { ICardStageCtor } from './i-card-stage'
import { ICityStageCtor } from './i-city-stage'
import { IRegionStageCtor } from './i-region-stage'

export type wayConfig = {
	path: string
	regionStageClass: IRegionStageCtor
	cityStageClass: ICityStageCtor
	cardsStageClass: ICardStageCtor
	logger: Logger
	clusterName: clusterNamesEnum | undefined
}
