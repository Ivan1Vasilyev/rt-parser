import RootStage, { wayConfig } from './stages/root/root-stage'
import RegionStage from './stages/region/region-stage'
import CityStage from './stages/city/city-stage'

const mainWayConfig: wayConfig = {
	url: 'https://maykop.rt.ru/packages/tariffs',
	regionStage: new RegionStage(new CityStage('1')),
}

const internetWayConfig: wayConfig = {
	url: 'https://maykop.rt.ru/homeinternet',
	regionStage: new RegionStage(new CityStage('1')),
}

const ranchoWayConfig: wayConfig = {
	url: 'https://rt.ru/homeinternet/private_house',
	regionStage: new RegionStage(new CityStage('1')),
}

const mainWay = new RootStage(mainWayConfig)
const internetWay = new RootStage(internetWayConfig)
const ranchoWay = new RootStage(ranchoWayConfig)

mainWay.go()
// internetWay.go()
// ranchoWay.go()
