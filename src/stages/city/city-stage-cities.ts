import DriverExtention from '../../extentions/driver/driver-extention'
import selectors from '../../utils/selectors'
import { ICityStage } from '../models/i-city-stage'
import { citiesDataType, tariffDataKeysEnum } from '../../extentions/models/i-xlsx-extention'
import xslxService from '../../extentions/xlsx/xlsx-extention'
import clustersService from '../../services/cluster/cluster-service'

export default class CityStageCities implements ICityStage {
	go = async (
		driver: DriverExtention,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		regionNumber: number | undefined,
		cityNumber: number | undefined
	) => {
		const citiesData = [] as citiesDataType[]
		const cluster = clustersService.getClusterName(regionName)

		for (let i = 0; i < citiesLength; i++) {
			const citiesDataTemplate = xslxService.getCitiesTemplte()

			try {
				if (cityNumber && regionNumber === currentRegionIndex && cityNumber > i) i = cityNumber

				const city = await driver.unsafeFind(selectors.cities, i)
				const cityName = await city.getText()

				citiesDataTemplate[tariffDataKeysEnum.cityName] = cityName
				citiesDataTemplate[tariffDataKeysEnum.region] = regionName
				citiesDataTemplate[tariffDataKeysEnum.cluster] = cluster

				citiesData.push(citiesDataTemplate)
			} catch (err) {
				throw { error: err, cityNumber: i }
			}
		}

		xslxService.writeCitiesFile(citiesData)
	}
}
