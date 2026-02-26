import { By, WebElement } from 'selenium-webdriver'
import selectors from '../../utils/selectors'
import { ICardStage } from '../card/i-card-stage'
import { ILoggerService, logStateEnum } from '../../services/logger/i-logger-service'
import { ICityStage } from './i-city-stage'
import AutoRestartError from '../../errors/auto-restart-error'
import { IDriverService } from '../../services/driver/i-driver-service'
import { cancelationTokenType, startParamsType } from '../root/root-stage-models'

export default class CityStage implements ICityStage {
	protected _isRefreshed: boolean = false
	protected _cityName: string = ''
	protected _cardStage: ICardStage
	protected _tariffsSelector: string = selectors.tariffs
	protected _containerSelector: string = selectors.container
	private _logger: ILoggerService

	constructor(CardStage: ICardStage, logger: ILoggerService) {
		this._cardStage = CardStage
		this._logger = logger
	}

	go = async (
		driver: IDriverService,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		cancelationToken: cancelationTokenType,
		{ regionNumber, cityNumber }: startParamsType,
	) => {
		for (let i = 0; i < citiesLength; i++) {
			try {
				if (cityNumber && regionNumber === currentRegionIndex && cityNumber > i) i = cityNumber

				await this._openCity(driver, cancelationToken, currentRegionIndex, i)

				const { index, isNoTariffs: isNoData } = await this._waitTariffs(driver, cancelationToken, i)

				i = index
				if (this._isRefreshed) continue

				if (cancelationToken.isInterrupted) return

				if (isNoData) {
					await this._logger.log(`в ${this._cityName} нет тарифов. ${i + 1} из ${citiesLength}`, logStateEnum.warning)
				} else {
					const cardsContainer = await this._getCardsContainer(driver)

					if (cancelationToken.isInterrupted) return

					await this._cardStage.go(driver, cardsContainer, this._cityName, regionName, cancelationToken)

					if (cancelationToken.isInterrupted) return

					await this._logger.log(`сбор данных в ${this._cityName} завершён. ${i + 1} из ${citiesLength}`)
				}

				await driver.openRegions(this._logger)

				if (cancelationToken.isInterrupted) return

				if (i < citiesLength - 1) {
					await this._clickCurrentRegion(driver, currentRegionIndex)

					if (cancelationToken.isInterrupted) return
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error)

				throw new AutoRestartError(message, { regionNumber: currentRegionIndex, cityNumber: i })
			}
		}
	}

	_clickCurrentRegion = async (driver: IDriverService, regionIndex: number): Promise<void> => {
		await driver.waitElementLocated(this._logger, selectors.regions, `конец цикла городов: ${this._cityName}`, async () => await driver.openRegions(this._logger))
		const currentRegion = await driver.unsafeFind(selectors.regions, regionIndex)
		await currentRegion.click()
		await driver.sleep(1000)
	}

	_openCity = async (driver: IDriverService, cancelationToken: cancelationTokenType, currentRegionIndex: number, cityIndex: number): Promise<void> => {
		if (this._isRefreshed) {
			// если мы после перезагрузки, значит, мы уже пришли в город, и нам не надо заполнять this._cityName и кликать по city
			await driver.waitElementLocated(this._logger, selectors.currentCity, 'currentCity после перезагрузки страницы _openCity', async () => await driver.refresh())

			this._isRefreshed = false
		} else {
			if (cancelationToken.isInterrupted) return

			// Первый клик региона был в region-stage, все последующие клики региона для итерации по городам - в this._clickCurrentRegion
			await driver.waitElementLocated(this._logger, selectors.regions, 'регионы в _openCity', async () => await driver.openRegions(this._logger))

			if (cancelationToken.isInterrupted) return

			await driver.waitCities(this._logger, currentRegionIndex, 'CityStage._openCity')

			const city = await driver.unsafeFind(selectors.cities, cityIndex)
			this._cityName = await city.getText()

			if (cancelationToken.isInterrupted) return

			await city.click()
		}

		await driver.sleep(700)
	}

	_waitTariffs = async (driver: IDriverService, cancelationToken: cancelationTokenType, index: number): Promise<{ index: number; isNoTariffs: boolean }> => {
		let counter = 0,
			isNoTariffs = false

		// ждём, что загрузится: тарифы или элемент, появляющийся, когда тарифов нет
		while (true) {
			const noData = await driver.findArray(selectors.noData)
			const tariffs = await driver.findArray(this._tariffsSelector)

			isNoTariffs = Boolean(noData.length)
			const istariffs = Boolean(tariffs.length)

			if (cancelationToken.isInterrupted) break

			if (!istariffs && !isNoTariffs) {
				await driver.sleep(1000)
				counter++
			}

			if (istariffs || isNoTariffs) break

			if (counter > 8) {
				await driver.refresh()
				await this._logger.log(`перезагрузка на тарифах: ${this._cityName}`, logStateEnum.warning)
				this._isRefreshed = true
				counter = 0
				index--
				await driver.sleep(1000)
				break
			}
		}

		return { index, isNoTariffs }
	}

	_getCardsContainer = async (driver: IDriverService): Promise<WebElement> => {
		const cardsContainer = await driver.findElement(By.css(this._containerSelector))

		await driver.acceptCookes()

		const deltaY = (await cardsContainer.getRect()).y
		await driver.scroll(deltaY)
		await driver.sleep(500)

		return cardsContainer
	}
}
