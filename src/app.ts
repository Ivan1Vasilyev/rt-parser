import RootStage, { wayConfig } from './stages/root/root-stage'
import CityStage from './stages/city/city-stage'
import CardStage from './stages/card/card-stage'
import { EAST_CLUSTER_NAME, WEST_CLUSTER_NAME, NORTH_CLUSTER_NAME, NORTH_WEST_CENTER_MOSCOW_CLUSTER_NAME } from './services/cluster/cluster-names'
import RegionStage from './stages/region/region-stage'
import { ClusterNamesType } from './services/cluster/cluster-service'
import CityStageInternet from './stages/city/city-stage-internet'
import CardStageInternet from './stages/card/card-stage-internet'
import CardStageRancho from './stages/card/card-stage-rancho'
import Logger from './services/logger/log-service'

let clusterName: ClusterNamesType | undefined

// clusterName = NORTH_WEST_CENTER_MOSCOW_CLUSTER_NAME

const mainWayConfig: wayConfig = {
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardsStageClass: CardStage,
	logger: new Logger('main'),
	fileName: 'РТ тарифы',
	clusterName,
}

const internetWayConfig: wayConfig = {
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageInternet,
	logger: new Logger('internet'),
	fileName: 'РТ тарифы интернет',
	clusterName,
}

const ranchoWayConfig: wayConfig = {
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageRancho,
	logger: new Logger('rancho'),
	fileName: 'РТ тарифы дача',
	clusterName,
}

const mainWay = new RootStage(mainWayConfig)
const internetWay = new RootStage(internetWayConfig)
const ranchoWay = new RootStage(ranchoWayConfig)

mainWay.go()
internetWay.go()
ranchoWay.go()
