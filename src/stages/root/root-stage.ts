import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { logStateEnum } from '../../services/models/log-state'
import { pageConfig } from '../../utils/page-config'
import { IRegionStage } from '../models/i-region-stage'

export default class RootStage {
	private _path: string
	private _regionStage: IRegionStage
	private _logger: Logger

	constructor({ path, regionStageClass, cityStageClass, cardStageClass, clusterConfig, logger }: pageConfig) {
		this._path = path
		this._logger = logger
		const cardStage = new cardStageClass()
		const cityStage = new cityStageClass(cardStage, logger)
		this._regionStage = new regionStageClass(cityStage, logger, clusterConfig)
	}

	go = async (regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		const driver = new DriverExtention()

		try {
			await driver.get(`https://rt.ru/${this._path}`)
			await driver.maximize()
			await driver.sleep(2000)
			await driver.acceptCookes()

			await this._regionStage.go(driver, regionNumber, cityNumber)

			await driver.quit()

			this._logger.log('Завершено')
		} catch (err: any) {
			const fixedRegionNumber = err.regionNumber ?? regionNumber ?? 0
			const fixedCityNumber = err.cityNumber ?? cityNumber ?? 0
			this._logger.log('я упал...', logStateEnum.error)
			this._logger.log(err.error || err, logStateEnum.error)
			console.log(err.error || err)
			this._logger.log(`для продолжения - номер региона: ${fixedRegionNumber}, номер города: ${fixedCityNumber}`, logStateEnum.warning)
			if (err.error?.name === 'NoSuchWindowError') {
				this._logger.log('было закрыто окно браузера', logStateEnum.warning)
			} else {
				if (err.error?.code === 'EBUSY') {
					this._logger.log(`В момент внесения записи файл .xslx был открыт`, logStateEnum.warning)
				}
				await driver.quit()
				this.go(fixedRegionNumber, fixedCityNumber)
			}
		}
	}
}
