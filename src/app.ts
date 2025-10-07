import RootStage from './stages/root/root-stage'
import CityStage from './stages/city/city-stage'
import CardStage from './stages/card/card-stage'
import RegionStage from './stages/region/region-stage'
import CityStageInternet from './stages/city/city-stage-internet'
import CardStageInternet from './stages/card/card-stage-internet'
import CardStageRancho from './stages/card/card-stage-rancho'
import Logger from './services/logger/log-service'
import { wayConfig } from './stages/models/way-config'
import { clusterNamesEnum } from './services/models/cluster'

let clusterName: clusterNamesEnum | undefined

// clusterName = clusterNamesEnum.east

const mainWayConfig: wayConfig = {
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardsStageClass: CardStage,
	logger: new Logger('main'),
	clusterName,
}

const internetWayConfig: wayConfig = {
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageInternet,
	logger: new Logger('internet'),
	clusterName,
}

const ranchoWayConfig: wayConfig = {
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageRancho,
	logger: new Logger('rancho'),
	clusterName,
}

new RootStage(mainWayConfig).go()
new RootStage(internetWayConfig).go()
new RootStage(ranchoWayConfig).go()
