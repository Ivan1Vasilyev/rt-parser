import { clusterNamesEnum } from './services/models/cluster'
import RootStage from './stages/root/root-stage'
import { getMainConfig, getInternetConfig, getRanchoConfig, getCitiesOnlyConfig } from './utils/page-config'
import { rootStageNamesEnum } from './stages/models/i-root-stage'
import ReadLineService from './services/readline/readline-service'

const east = clusterNamesEnum.east // Восток
const north = clusterNamesEnum.north // Север
const south = clusterNamesEnum.south // Юг
const westCenterMoscow = clusterNamesEnum.westCenterMoscow // Запад, Центр, Москва

const clusters = [] as clusterNamesEnum[] // пустой - парсится всё.

const mainWayConfig = getMainConfig(clusters)
const internetWayConfig = getInternetConfig(clusters)
const ranchoWayConfig = getRanchoConfig(clusters)
const citiesOnlyConfig = getCitiesOnlyConfig(clusters)

const mainWay = new RootStage(mainWayConfig, rootStageNamesEnum.main)
const internetWay = new RootStage(internetWayConfig, rootStageNamesEnum.internet)
const ranchoWay = new RootStage(ranchoWayConfig, rootStageNamesEnum.rancho)
const citiesOnlyWay = new RootStage(citiesOnlyConfig, rootStageNamesEnum.cities)

mainWay.go()
internetWay.go()
ranchoWay.go()
// citiesOnlyWay.go()

new ReadLineService(mainWay, internetWay, ranchoWay).init()
