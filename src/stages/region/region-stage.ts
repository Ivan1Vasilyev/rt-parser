import selectors from '../../utils/selectors'
import { ICityStage } from '../models/i-city-stage'
import DriverExtention from '../../extentions/driver/driver-extention'
import clustersService from '../../services/cluster/cluster-service'
import { IRegionStage } from '../models/i-region-stage'
import Logger from '../../services/logger/log-service'
import { logStateEnum } from '../../services/models/log-state'
import { clusterNamesEnum } from '../../services/models/cluster'

export default class RegionStage implements IRegionStage {
	private _cityStage: ICityStage
	private _filteredRegions: string[]
	private _logger: Logger

	constructor(cityStage: ICityStage, logger: Logger, clustes: clusterNamesEnum[]) {
		this._cityStage = cityStage
		this._logger = logger

		this._filteredRegions = clustersService.getRegions(clustes)
	}

	go = async (driver: DriverExtention, regionNumber: number | undefined, cityNumber: number | undefined) => {
		await driver.openRegions(this._logger)

		const regionsLength = (await driver.findArray(selectors.regions)).length

		const isCluster = Boolean(this._filteredRegions.length)
		let filteredRegionCounter = isCluster ? 0 : null
		const filteredRegionsLength = isCluster ? this._filteredRegions.length : regionsLength

		for (let i = 0; i < regionsLength; i++) {
			if (regionNumber && regionNumber > i) i = regionNumber

			try {
				await driver.waitElementLocated(this._logger, selectors.regions, 'regions', async () => await driver.openRegions(this._logger))

				const region = await driver.unsafeFind(selectors.regions, i)
				const regionName = await region.getText()

				if (this._filteredRegions.length > 0 && !this._filteredRegions.some((r: string) => regionName.includes(r))) continue
				this._logger.log('регион: ' + regionName)

				if (filteredRegionCounter !== null) filteredRegionCounter++

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

					await driver.refresh()
					await driver.sleep(3000)

					i--
					continue
				}

				await this._cityStage.go(driver, citiesLength, regionName, i, regionNumber, cityNumber)

				this._logger.log(`сбор данных по региону ${regionName} завершён. ${filteredRegionCounter ?? i + 1} из ${filteredRegionsLength}`)
			} catch (err: any) {
				throw { error: err.error || err, regionNumber: i, cityNumber: err.cityNumber || cityNumber }
			}
		}
	}
}
