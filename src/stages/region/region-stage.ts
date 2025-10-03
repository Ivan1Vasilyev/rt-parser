import selectors from '../../utils/selectors'
import { ICityStage } from '../city/i-city-stage'
import DriverExtention from '../../extentions/driver/driver-extention'
import clustersService, { ClusterNamesType } from '../../services/cluster/cluster-service'
import { IRegionStage } from './i-region-stage'
import Logger, { logStateEnum } from '../../services/logger/log-service'

export default class RegionStage implements IRegionStage {
	private _cityStage: ICityStage
	private _clusters?: string[]
	private _logger: Logger

	constructor(cityStage: ICityStage, logger: Logger, clusterName?: ClusterNamesType) {
		this._cityStage = cityStage
		this._logger = logger
		if (clusterName) {
			this._clusters = clustersService.getRegionsByCluster(clusterName)
		}
	}

	go = async (driver: DriverExtention, regionsLength: number, regionNumber: number | undefined, cityNumber: number | undefined) => {
		for (let i = 0; i < regionsLength; i++) {
			if (regionNumber && regionNumber > i) i = regionNumber

			try {
				await driver.waitElementLocated(this._logger, selectors.regions, 'regions', async () => await driver.openRegions(this._logger))

				const region = await driver.unsafeFind(selectors.regions, i)
				const regionName = await region.getText()

				if (this._clusters && !this._clusters.some((r: string) => regionName.includes(r))) continue
				this._logger.log('регион: ' + regionName)

				await region.click()
				await driver.sleep(3000)
				await driver.waitElementLocated(this._logger, selectors.cities, 'cities', async () => {
					await driver.openRegions(this._logger)
					await driver.waitElementLocated(this._logger, selectors.regions, 'regions', async () => await driver.openRegions(this._logger))
					const region = await driver.unsafeFind(selectors.regions, i)
					await region.click()
				})
				const citiesLength = (await driver.findArray(selectors.cities)).length
				if (citiesLength == 0) {
					this._logger.log(`В регионе ${regionName} не загрузились города`, logStateEnum.warning)
					this._logger.log(`Индекс региона: ${i}`, logStateEnum.warning)

					await driver.navigate().refresh()
					await driver.sleep(3000)
					await driver.openRegions(this._logger)

					i--
					continue
				}

				await this._cityStage.go(driver, citiesLength, regionName, i, regionNumber, cityNumber)

				this._logger.log(`сбор данных по региону ${regionName} завершён. ${i + 1} из ${regionsLength}`)
			} catch (err: any) {
				throw { error: err.error || err, regionNumber: i, cityNumber: err.cityNumber || cityNumber }
			}
		}
	}
}
