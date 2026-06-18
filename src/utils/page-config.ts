import { clusterNamesEnum } from '../services/cluster/cluster-models'
import CardStage from '../stages/card/card-stage'
import CardStageInternet from '../stages/card/card-stage-internet'
import CardStageRancho from '../stages/card/card-stage-rancho'
import CityStage from '../stages/city/city-stage'
import CityStageCities from '../stages/city/city-stage-cities'
import CityStageInternet from '../stages/city/city-stage-internet'
import { ICardStageCtor } from '../stages/card/i-card-stage'
import RegionStage from '../stages/region/region-stage'
import { ICityStageCtor } from '../stages/city/i-city-stage'
import { IRegionStageCtor } from '../stages/region/i-region-stage'

export type pageConfig = {
	path: string
	regionStageClass: IRegionStageCtor
	cityStageClass: ICityStageCtor
	cardStageClass: ICardStageCtor
	clusters: clusterNamesEnum[]
}

// clusters формируем в app.ts, просто потому что он 1 на всех и там удобнее

export const getConvergentConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet/internet_tv_mobile',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardStageClass: CardStage,
	clusters
})

export const getMobileConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet/internet_mobile',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardStageClass: CardStage,
	clusters
})

export const getInternetTvConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet/internet_tv',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardStageClass: CardStage,
	clusters
})

export const getMainConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardStageClass: CardStage,
	clusters
})

export const getInternetConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardStageClass: CardStageInternet,
	clusters
})

export const getRanchoConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardStageClass: CardStageRancho,
	clusters
})

export const getCitiesOnlyConfig = (clusters: clusterNamesEnum[]): pageConfig => ({
	path: '',
	regionStageClass: RegionStage,
	cityStageClass: CityStageCities,
	cardStageClass: CardStage,
	clusters
})
