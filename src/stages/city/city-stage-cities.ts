import selectors from '../../utils/selectors'
import { citiesDataType, tariffDataKeysEnum } from '../../services/xlsx/xlsx-models'
import clustersService from '../../services/cluster/cluster-service'
import { ICityStage } from './i-city-stage'
import xlsxService from '../../services/xlsx/xlsx-service'
import { IDriverService } from '../../services/driver/i-driver-service'
import { cancelationTokenType, startParamsType } from '../root/root-stage-models'

export default class CityStageCities implements ICityStage {
	go = async (
		driver: IDriverService,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		cancelationToken: cancelationTokenType,
		{ regionNumber, cityNumber }: startParamsType,
	) => {
		const citiesData = [] as citiesDataType[]
		const cluster = clustersService.getClusterName(regionName)

		for (let i = 0; i < citiesLength; i++) {
			const citiesDataTemplate = xlsxService.getCitiesTemplte()
			if (cancelationToken.isInterrupted) return

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

		xlsxService.writeCitiesFile(citiesData)
	}
}
