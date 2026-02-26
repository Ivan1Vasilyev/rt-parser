import selectors from '../../utils/selectors'
import clustersService from '../../services/cluster/cluster-service'
import { ILoggerService, logStateEnum } from '../../services/logger/i-logger-service'
import { clusterNamesEnum } from '../../services/cluster/cluster-models'
import { ICityStage } from '../city/i-city-stage'
import { IRegionStage } from './i-region-stage'
import { IDriverService } from '../../services/driver/i-driver-service'
import AutoRestartError from '../../errors/auto-restart-error'
import { cancelationTokenType, startParamsType } from '../root/root-stage-models'

export default class RegionStage implements IRegionStage {
	private _cityStage: ICityStage
	private _filteredRegions: string[]
	private _logger: ILoggerService

	constructor(cityStage: ICityStage, logger: ILoggerService, clusters: clusterNamesEnum[]) {
		this._cityStage = cityStage
		this._logger = logger

		this._filteredRegions = clustersService.getRegions(clusters)
	}

	go = async (driver: IDriverService, cancelationToken: cancelationTokenType, { regionNumber, cityNumber }: startParamsType) => {
		await driver.acceptCookes()
		await driver.openRegions(this._logger)

		if (cancelationToken.isInterrupted) return

		const regionsLength = (await driver.findArray(selectors.regions)).length

		// это для корректной итерации и отображения прогресса в случае, если идём по кластерам
		const isCluster = Boolean(this._filteredRegions.length)
		let filteredRegionCounter = isCluster ? 0 : null
		const filteredRegionsLength = isCluster ? this._filteredRegions.length : regionsLength

		for (let i = 0; i < regionsLength; i++) {
			if (regionNumber && regionNumber > i) i = regionNumber
			try {
				await driver.waitElementLocated(this._logger, selectors.regions, 'регионы', async () => await driver.openRegions(this._logger))

				const region = await driver.unsafeFind(selectors.regions, i)
				const regionName = await region.getText()

				// Пропускаем, если регион не в составе кластеров
				if (this._filteredRegions.length > 0 && !this._filteredRegions.some((r: string) => regionName.includes(r))) continue
				if (filteredRegionCounter !== null) filteredRegionCounter++

				await this._logger.log('регион: ' + regionName)

				await region.click()
				await driver.sleep(3000)

				if (cancelationToken.isInterrupted) return

				await driver.waitCities(this._logger, i, 'regionStage')

				const citiesLength = (await driver.findArray(selectors.cities)).length
				if (citiesLength == 0) {
					await this._logger.log(`В регионе ${regionName} не загрузились города`, logStateEnum.warning)
					await this._logger.log(`Индекс региона: ${i}`, logStateEnum.warning)

					await driver.refresh()
					await driver.sleep(3000)

					if (cancelationToken.isInterrupted) return

					if (filteredRegionCounter !== null) filteredRegionCounter--

					i--
					continue
				}

				await this._cityStage.go(driver, citiesLength, regionName, i, cancelationToken, { regionNumber, cityNumber })
				if (cancelationToken.isInterrupted) return

				await this._logger.log(`сбор данных по региону ${regionName} завершён. ${filteredRegionCounter ?? i + 1} из ${filteredRegionsLength}`)
			} catch (error) {
				if (error instanceof AutoRestartError) {
					throw error
				}

				if (error instanceof Error) {
					throw new AutoRestartError(error.message, { regionNumber: i, cityNumber: 0 })
				}

				throw error
			}
		}
	}
}
