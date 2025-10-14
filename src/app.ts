import { clusterNamesEnum, clusterConfigType } from './services/models/cluster'
import RootStage from './stages/root/root-stage'
import { getMainConfig, getInternetConfig, getRanchoConfig, getCitiesOnlyConfig } from './utils/config'

const east = clusterNamesEnum.east // Восток
const west = clusterNamesEnum.north // Запад
const south = clusterNamesEnum.south // Юг
const northCenterMoscow = clusterNamesEnum.westCenterMoscow //Север, Центр, Москва

const clusterNames = [] as clusterNamesEnum[]

/*
isExcept: false => только указанные кластеры
isExcept: true => всё, кроме указанных кластеров
*/
const isExcept = false

const clusterConfig: clusterConfigType = { clusterNames, isExcept }

const mainWayConfig = getMainConfig(clusterConfig)
const internetWayConfig = getInternetConfig(clusterConfig)
const ranchoWayConfig = getRanchoConfig(clusterConfig)
const citiesOnlyConfig = getCitiesOnlyConfig(clusterConfig)

new RootStage(mainWayConfig).go()
new RootStage(internetWayConfig).go()
new RootStage(ranchoWayConfig).go()
// new RootStage(citiesOnlyConfig).go()
