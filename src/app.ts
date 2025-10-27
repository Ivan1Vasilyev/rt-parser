import { clusterNamesEnum } from './services/models/cluster'
import RootStage from './stages/root/root-stage'
import { getMainConfig, getInternetConfig, getRanchoConfig, getCitiesOnlyConfig } from './utils/page-config'

const east = clusterNamesEnum.east // Восток
const north = clusterNamesEnum.north // Север
const south = clusterNamesEnum.south // Юг
const westCenterMoscow = clusterNamesEnum.westCenterMoscow // Запад, Центр, Москва

const clusters = [] as clusterNamesEnum[] // пустой - парсится всё.

const mainWayConfig = getMainConfig(clusters)
const internetWayConfig = getInternetConfig(clusters)
const ranchoWayConfig = getRanchoConfig(clusters)
const citiesOnlyConfig = getCitiesOnlyConfig(clusters)

new RootStage(mainWayConfig).go()
new RootStage(internetWayConfig).go()
new RootStage(ranchoWayConfig).go()
// new RootStage(citiesOnlyConfig).go()
