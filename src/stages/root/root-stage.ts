import AutoRestartError from '../../errors/auto-restart-error'
import createDriver from '../../services/driver/driver-service'
import { IDriverService } from '../../services/driver/i-driver-service'
import { ILoggerService, logStateEnum } from '../../services/logger/i-logger-service'
import LoggerService from '../../services/logger/logger-service'
import { pageConfig } from '../../utils/page-config'
import { IRegionStage } from '../region/i-region-stage'
import { IRootStage } from './i-root-stage'
import { cancelationTokenType, rootStageNamesEnum, startParamsType } from './root-stage-models'

export default class RootStage implements IRootStage {
	private _path: string
	private _regionStage: IRegionStage
	private _logger: ILoggerService
	private _isOnWork = false
	private _isOnRestarting = false

	public cancelationToken: cancelationTokenType = { isInterrupted: false }
	public name: rootStageNamesEnum

	constructor({ path, regionStageClass, cityStageClass, cardStageClass, clusters }: pageConfig, name: rootStageNamesEnum) {
		this.name = name
		this._path = path
		this._logger = new LoggerService(name)
		const cardStage = new cardStageClass()
		const cityStage = new cityStageClass(cardStage, this._logger)
		this._regionStage = new regionStageClass(cityStage, this._logger, clusters)
	}

	stop = () => {
		if (!this._isOnWork) {
			console.log(`${this.name} уже остановлен`)
			return
		}

		this.cancelationToken.isInterrupted = true
	}

	start = ({ regionNumber, cityNumber }: startParamsType): void => {
		if (this._isOnWork) {
			console.log(`${this.name} уже работает`)
			return
		}

		this.go(regionNumber, cityNumber)
	}

	restart = ({ regionNumber, cityNumber }: startParamsType) => {
		if (this._isOnRestarting) {
			console.log(`${this.name} уже на рестарте, дождитесь`)
			return
		}

		if (!this._isOnWork) {
			console.log(`${this.name} остановлен, используйте start`)
			return
		}

		this.stop()
		this._isOnRestarting = true

		let interval = setInterval(() => {
			if (!this.cancelationToken.isInterrupted) {
				clearInterval(interval)

				this._isOnRestarting = false
				this.go(regionNumber, cityNumber)
			}
		}, 500)
	}

	go = async (regionNumber?: number, cityNumber?: number) => {
		this._isOnWork = true
		const driver = createDriver()

		try {
			await this._openWindow(driver)
			await this._regionStage.go(driver, this.cancelationToken, { regionNumber, cityNumber })
			await this._closeAndFinish(driver)
		} catch (error) {
			this._isOnWork = false
			this._errorHandler(driver, error, regionNumber, cityNumber)
		}
	}

	_openWindow = async (driver: IDriverService) => {
		await driver.get(`https://rt.ru/${this._path}`)
		await driver.maximize()
		await driver.sleep(2000)
	}

	_closeAndFinish = async (driver: IDriverService) => {
		await driver.quit()

		const message = this.cancelationToken.isInterrupted ? 'Прервано' : 'Завершено'
		await this._logger.log(message)

		this.cancelationToken.isInterrupted = false
		this._isOnWork = false
	}

	_errorHandler = async (driver: IDriverService, error: unknown, regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		console.log(new Date().toLocaleTimeString())
		console.log(error)

		if (!(error instanceof Error)) {
			console.log('в catch попал не Error')
			return
		}

		const isAutoRestartError = error instanceof AutoRestartError

		const fixedRegionNumber = isAutoRestartError ? error.regionNumber : (regionNumber ?? 0)
		const fixedCityNumber = isAutoRestartError ? error.cityNumber : (cityNumber ?? 0)

		await this._logger.log('я упал...', logStateEnum.error)
		await this._logger.log(error.toString(), logStateEnum.error)
		await this._logger.log(`для продолжения - регион, город: ${fixedRegionNumber} ${fixedCityNumber}`, logStateEnum.warning)

		if (error.name === 'NoSuchWindowError') {
			await this._logger.log('было закрыто окно браузера', logStateEnum.warning)
		} else {
			if (error.message.includes('EBUSY')) {
				await this._logger.log(`В момент внесения записи файл .xslx был открыт`, logStateEnum.warning)
			}

			await driver.quit()
			this.go(fixedRegionNumber, fixedCityNumber)
		}
	}
}
