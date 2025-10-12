import RootStage from './stages/root/root-stage'
import CityStage from './stages/city/city-stage'
import CardStage from './stages/card/card-stage'
import RegionStage from './stages/region/region-stage'
import CityStageInternet from './stages/city/city-stage-internet'
import CardStageInternet from './stages/card/card-stage-internet'
import CardStageRancho from './stages/card/card-stage-rancho'
import Logger from './services/logger/log-service'
import { wayConfig } from './stages/models/way-config'
import { clusterConfigType, clusterNamesEnum } from './services/models/cluster'

/*
east = 'Восток',
west = 'Запад',
north = 'Юг',
northWestCenterMoscow = 'Северо-Запад, Центр, Москва',
*/
const clusterNames = [clusterNamesEnum.east]

/*
isExcept: false => только указанные кластеры
isExcept: true => всё, кроме указанных кластеров
*/
const isExcept = false

const clusterConfig: clusterConfigType = { clusterNames, isExcept }

const mainWayConfig: wayConfig = {
	path: 'packages/tariffs',
	regionStageClass: RegionStage,
	cityStageClass: CityStage,
	cardsStageClass: CardStage,
	logger: new Logger('main'),
	clusterConfig,
}

const internetWayConfig: wayConfig = {
	path: 'homeinternet',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageInternet,
	logger: new Logger('internet'),
	clusterConfig,
}

const ranchoWayConfig: wayConfig = {
	path: 'homeinternet/private_house',
	regionStageClass: RegionStage,
	cityStageClass: CityStageInternet,
	cardsStageClass: CardStageRancho,
	logger: new Logger('rancho'),
	clusterConfig,
}

new RootStage(mainWayConfig).go()
new RootStage(internetWayConfig).go()
new RootStage(ranchoWayConfig).go()
