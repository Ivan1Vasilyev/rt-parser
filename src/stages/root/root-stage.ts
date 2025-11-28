import DriverExtention from '../../extentions/driver/driver-extention'
import Logger from '../../services/logger/log-service'
import { logStateEnum } from '../../services/models/log-state'
import { pageConfig } from '../../utils/page-config'
import { cancelationTokenType } from '../models/cancelation-token'
import { IRegionStage } from '../models/i-region-stage'
import { IRootStage, rootStageNamesEnum } from '../models/i-root-stage'

export default class RootStage implements IRootStage {
	private _path: string
	private _regionStage: IRegionStage
	private _logger: Logger
	private _isOnWork = false

	public cancelationToken: cancelationTokenType = { isInterrupted: false }
	public name: rootStageNamesEnum

	constructor({ path, regionStageClass, cityStageClass, cardStageClass, clusters: clustes }: pageConfig, name: rootStageNamesEnum) {
		this.name = name
		this._path = path
		this._logger = new Logger(name)
		const cardStage = new cardStageClass()
		const cityStage = new cityStageClass(cardStage, this._logger)
		this._regionStage = new regionStageClass(cityStage, this._logger, clustes)
	}

	restart = (regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		if (this._isOnWork && !this.cancelationToken.isInterrupted) {
			console.log(`${this.name} is already started`)
			return
		}

		let interval = setInterval(() => {
			if (!this.cancelationToken.isInterrupted && !this._isOnWork) {
				clearInterval(interval)

				this.go(regionNumber, cityNumber)
			}
		}, 500)
	}

	go = async (regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		this._isOnWork = true
		const driver = new DriverExtention()

		try {
			await driver.get(`https://rt.ru/${this._path}`)
			await driver.maximize()
			await driver.sleep(2000)
			await driver.acceptCookes()

			await this._regionStage.go(driver, regionNumber, cityNumber, this.cancelationToken)

			const message = this.cancelationToken.isInterrupted ? 'Прервано' : 'Завершено'
			this.cancelationToken.isInterrupted = false

			await driver.quit()

			this._logger.log(message)
			this._isOnWork = false
		} catch (err: any) {
			this._isOnWork = false

			const fixedRegionNumber = err.regionNumber ?? regionNumber ?? 0
			const fixedCityNumber = err.cityNumber ?? cityNumber ?? 0

			this._logger.log('я упал...', logStateEnum.error)
			this._logger.log(err.error || err, logStateEnum.error)
			console.log(err.error || err)
			this._logger.log(`для продолжения - регион, город: ${fixedRegionNumber}, ${fixedCityNumber}`, logStateEnum.warning)

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
