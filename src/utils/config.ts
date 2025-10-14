import Logger from '../services/logger/log-service'
import { clusterConfigType } from '../services/models/cluster'
import CardStage from '../stages/card/card-stage'
import CardStageInternet from '../stages/card/card-stage-internet'
import CardStageRancho from '../stages/card/card-stage-rancho'
import CityStage from '../stages/city/city-stage'
import CityStageCities from '../stages/city/city-stage-cities'
import CityStageInternet from '../stages/city/city-stage-internet'
import { wayConfig } from '../stages/models/way-config'
import RegionStage from '../stages/region/region-stage'

export const getMainConfig = (clusterConfig: clusterConfigType): wayConfig => ({
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardsStageClass: CardStage,
	logger: new Logger('main'),
	clusterConfig,
})

export const getInternetConfig = (clusterConfig: clusterConfigType): wayConfig => ({
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageInternet,
	logger: new Logger('internet'),
	clusterConfig,
})

export const getRanchoConfig = (clusterConfig: clusterConfigType): wayConfig => ({
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageRancho,
	logger: new Logger('rancho'),
	clusterConfig,
})

export const getCitiesOnlyConfig = (clusterConfig: clusterConfigType): wayConfig => ({
	path: '',
	regionStageClass: RegionStage,
	cityStageClass: CityStageCities,
	cardsStageClass: CardStage,
	logger: new Logger('cities'),
	clusterConfig,
})
