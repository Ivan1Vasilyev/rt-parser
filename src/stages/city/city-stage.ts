import { By } from 'selenium-webdriver'
import selectors from '../../utils/selectors'
import { ICityStage } from '../models/i-city-stage'
import DriverExtention from '../../extentions/driver/driver-extention'
import { ICardStage } from '../models/i-card-stage'
import Logger from '../../services/logger/log-service'
import { logStateEnum } from '../../services/models/log-state'
import { cancelationTokenType } from '../models/cancelation-token'

export default class CityStage implements ICityStage {
	protected _isRefreshed: boolean = false
	protected _cityName: string = ''
	protected _cardStageClass: ICardStage
	protected _tariffsSelector: string = selectors.tariffs
	protected _containerSelector: string = selectors.container
	private _logger: Logger

	constructor(CardStageClass: ICardStage, logger: Logger) {
		this._cardStageClass = CardStageClass
		this._logger = logger
	}

	go = async (
		driver: DriverExtention,
		citiesLength: number,
		regionName: string,
		currentRegionIndex: number,
		regionNumber: number | undefined,
		cityNumber: number | undefined,
		cancelationToken: cancelationTokenType
	) => {
		for (let i = 0; i < citiesLength; i++) {
			try {
				if (cityNumber && regionNumber === currentRegionIndex && cityNumber > i) i = cityNumber

				if (cancelationToken.isInterrupted) return

				if (this._isRefreshed) {
					await driver.waitElementLocated(this._logger, selectors.currentCity, 'currentCity после перезагрузки страницы', async () => await driver.refresh())

					this._isRefreshed = false
				} else {
					if (cancelationToken.isInterrupted) return
					await driver.waitElementLocated(this._logger, selectors.regions, 'ожидание регионов', async () => await driver.openRegions(this._logger))

					if (cancelationToken.isInterrupted) return
					await driver.waitElementLocated(this._logger, selectors.cities, 'ожидание городов', async () => {
						await driver.openRegions(this._logger)
						await driver.waitElementLocated(
							this._logger,
							selectors.regions,
							'ожидание регионов, не дождались городов',
							async () => await driver.openRegions(this._logger)
						)
						const region = await driver.unsafeFind(selectors.regions, currentRegionIndex)
						await region.click()
					})

					if (cancelationToken.isInterrupted) return
					const city = await driver.unsafeFind(selectors.cities, i)
					this._cityName = await city.getText()

					await city.click()
				}

				await driver.sleep(700)

				let noData,
					tariffs,
					counter = 0

				while (true) {
					noData = await driver.findArray(selectors.noData)
					tariffs = await driver.findArray(this._tariffsSelector)

					if (cancelationToken.isInterrupted) return

					if (!tariffs.length && !noData.length) {
						await driver.sleep(1000)
						counter++
					}

					if (tariffs.length || noData.length) break

					if (counter > 8) {
						await driver.refresh()
						this._logger.log(`перезагрузка на тарифах: ${this._cityName}`, logStateEnum.warning)
						this._isRefreshed = true
						counter = 0
						i--
						await driver.sleep(1000)
						break
					}
				}

				if (this._isRefreshed) continue

				if (noData.length) {
					this._logger.log(`в ${this._cityName} нет тарифов. ${i + 1} из ${citiesLength}`, logStateEnum.warning)
				} else {
					const cardsContainer = await driver.findElement(By.css(this._containerSelector))
					if (cancelationToken.isInterrupted) return

					await driver.acceptCookes()

					const deltaY = (await cardsContainer.getRect()).y
					await driver.scroll(deltaY)
					await driver.sleep(500)

					if (cancelationToken.isInterrupted) return

					await this._cardStageClass.go(driver, cardsContainer, this._cityName, regionName)

					if (cancelationToken.isInterrupted) return

					this._logger.log(`сбор данных в ${this._cityName} завершён. ${i + 1} из ${citiesLength}`)
				}

				await driver.openRegions(this._logger)

				if (cancelationToken.isInterrupted) return

				if (i < citiesLength - 1) {
					await driver.waitElementLocated(this._logger, selectors.regions, `конец цикла городов: ${this._cityName}`, async () => await driver.openRegions(this._logger))
					const currentRegion = (await driver.findArray(selectors.regions))[currentRegionIndex]
					await currentRegion.click()
					await driver.sleep(1000)

					if (cancelationToken.isInterrupted) return
				}
			} catch (err) {
				throw { thrownError: err, cityNumber: i }
			}
		}
	}
}
