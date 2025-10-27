import Logger from '../services/logger/log-service'
import { clusterNamesEnum } from '../services/models/cluster'
import CardStage from '../stages/card/card-stage'
import CardStageInternet from '../stages/card/card-stage-internet'
import CardStageRancho from '../stages/card/card-stage-rancho'
import CityStage from '../stages/city/city-stage'
import CityStageCities from '../stages/city/city-stage-cities'
import CityStageInternet from '../stages/city/city-stage-internet'
import { ICardStageCtor } from '../stages/models/i-card-stage'
import { ICityStageCtor } from '../stages/models/i-city-stage'
import { IRegionStageCtor } from '../stages/models/i-region-stage'
import RegionStage from '../stages/region/region-stage'

export type pageConfig = {
	path: string
	regionStageClass: IRegionStageCtor
	cityStageClass: ICityStageCtor
	cardStageClass: ICardStageCtor
	logger: Logger
	clustes: clusterNamesEnum[]
}

// clusterConfig формируем в app.ts, просто потому что он 1 на всех и там удобнее

export const getMainConfig = (clustes: clusterNamesEnum[]): pageConfig => ({
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardStageClass: CardStage,
	logger: new Logger('main'),
	clustes,
})

export const getInternetConfig = (clustes: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardStageClass: CardStageInternet,
	logger: new Logger('internet'),
	clustes,
})

export const getRanchoConfig = (clustes: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardStageClass: CardStageRancho,
	logger: new Logger('rancho'),
	clustes,
})

export const getCitiesOnlyConfig = (clustes: clusterNamesEnum[]): pageConfig => ({
	path: '',
	regionStageClass: RegionStage,
	cityStageClass: CityStageCities,
	cardStageClass: CardStage,
	logger: new Logger('cities'),
	clustes,
})
