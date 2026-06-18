import { clusterNamesEnum } from './services/cluster/cluster-models'
import RootStage from './stages/root/root-stage'
import { getInternetConfig, getRanchoConfig, getCitiesOnlyConfig, getConvergentConfig, getMobileConfig, getInternetTvConfig } from './utils/page-config'
import readLineService from './services/readline/readline-service'
import { rootStageNamesEnum } from './stages/root/root-stage-models'

const east = clusterNamesEnum.east // Восток
const north = clusterNamesEnum.north // Север
const south = clusterNamesEnum.south // Юг
const westCenterMoscow = clusterNamesEnum.westCenterMoscow // Запад, Центр, Москва

const clusters = [] as clusterNamesEnum[] // если пустой, парсится всё.

const internetWayConfig = getInternetConfig(clusters)
const ranchoWayConfig = getRanchoConfig(clusters)
const citiesOnlyConfig = getCitiesOnlyConfig(clusters)
const convergentConfig = getConvergentConfig(clusters)
const mobileConfig = getMobileConfig(clusters)
const internetTvConfig = getInternetTvConfig(clusters)

const convergentWay = new RootStage(convergentConfig, rootStageNamesEnum.convergent)
const mobileWay = new RootStage(mobileConfig, rootStageNamesEnum.mobile)
const internetTvWay = new RootStage(internetTvConfig, rootStageNamesEnum.internetTv)
const internetWay = new RootStage(internetWayConfig, rootStageNamesEnum.internet)
const ranchoWay = new RootStage(ranchoWayConfig, rootStageNamesEnum.rancho)
const citiesOnlyWay = new RootStage(citiesOnlyConfig, rootStageNamesEnum.cities)

readLineService.init(internetWay, ranchoWay, citiesOnlyWay, convergentWay, mobileWay, internetTvWay)

internetWay.go()
ranchoWay.go()
// citiesOnlyWay.go()

convergentWay.go()
mobileWay.go()
internetTvWay.go()
