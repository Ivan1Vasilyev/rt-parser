import RootStage from './stages/root/root-stage.js'
import RegionStage from './stages/region/region-stage.js'
import CityStage from './stages/city/city-stage.js'

const mainWayConfig = {
	url: 'https://maykop.rt.ru/packages/tariffs',
	regionStage: new RegionStage(new CityStage()),
}

const mainWay = new RootStage(mainWayConfig)
// const internetWay = new MainStage('https://maykop.rt.ru/homeinternet')

mainWay.go()
// internetWay.go();
