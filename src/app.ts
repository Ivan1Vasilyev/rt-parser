import { clusterNamesEnum } from './services/cluster/cluster-models'
import RootStage from './stages/root/root-stage'
import { getMainConfig, getInternetConfig, getRanchoConfig, getCitiesOnlyConfig } from './utils/page-config'
import readLineService from './services/readline/readline-service'
import { rootStageNamesEnum } from './stages/root/i-root-stage'

const east = clusterNamesEnum.east // Восток
const north = clusterNamesEnum.north // Север
const south = clusterNamesEnum.south // Юг
const westCenterMoscow = clusterNamesEnum.westCenterMoscow // Запад, Центр, Москва

const clusters = [] as clusterNamesEnum[] // если пустой, парсится всё.

const mainWayConfig = getMainConfig(clusters)
const internetWayConfig = getInternetConfig(clusters)
const ranchoWayConfig = getRanchoConfig(clusters)
const citiesOnlyConfig = getCitiesOnlyConfig(clusters)

const mainWay = new RootStage(mainWayConfig, rootStageNamesEnum.main)
const internetWay = new RootStage(internetWayConfig, rootStageNamesEnum.internet)
const ranchoWay = new RootStage(ranchoWayConfig, rootStageNamesEnum.rancho)
const citiesOnlyWay = new RootStage(citiesOnlyConfig, rootStageNamesEnum.cities)

readLineService.init(mainWay, internetWay, ranchoWay, citiesOnlyWay)

mainWay.go()
internetWay.go()
ranchoWay.go()
// citiesOnlyWay.go()
