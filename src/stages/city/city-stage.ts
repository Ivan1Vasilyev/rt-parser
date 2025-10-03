import { By } from 'selenium-webdriver'
import selectors from '../../utils/selectors'
import { ICityStage } from './i-city-stage'
import DriverExtention from '../../extentions/driver/driver-extention'
import { ICardStage } from '../card/i-card-stage'
import Logger, { logStateEnum } from '../../services/logger/log-service'

export default class CityStage implements ICityStage {
	protected _refreshed: boolean = false
	protected _cityName: string = ''
	protected _cardStageClass: ICardStage
	protected _tariffsSelector: string = selectors.tariffs
	protected _containerSelector: string = selectors.container
	private _logger: Logger

	constructor(CardStageClass: ICardStage, logger: Logger) {
		this._cardStageClass = CardStageClass
		this._logger = logger
	}

	go = async (driver: DriverExtention, citiesLength: number, regionName: string, i: number, regionNumber: number | undefined, cityNumber: number | undefined) => {
		for (let j = 0; j < citiesLength; j++) {
			try {
				if (cityNumber && regionNumber === i && cityNumber > j) j = cityNumber

				if (this._refreshed) {
					await driver.waitElementLocated(this._logger, selectors.currentCity, 'currentCity after refresh', async () => await driver.navigate().refresh())

					this._refreshed = false
				} else {
					await driver.waitElementLocated(this._logger, selectors.regions, 'regions', async () => await driver.openRegions(this._logger))
					await driver.waitElementLocated(this._logger, selectors.cities, 'cities', async () => {
						await driver.openRegions(this._logger)
						await driver.waitElementLocated(this._logger, selectors.regions, 'regions after cities', async () => await driver.openRegions(this._logger))
						const region = await driver.unsafeFind(selectors.regions, i)
						await region.click()
					})

					const city = await driver.unsafeFind(selectors.cities, j)
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

					if (!tariffs.length && !noData.length) {
						await driver.sleep(1000)
						counter++
					}

					if (tariffs.length || noData.length) break

					if (counter > 8) {
						await driver.refresh()
						this._logger.log(`refreshed in loading tariffs. City: ${this._cityName}`, logStateEnum.warning)
						this._refreshed = true
						counter = 0
						j--
						await driver.sleep(1000)
						break
					}
				}

				if (this._refreshed) continue

				if (noData.length) {
					this._logger.log(`в ${this._cityName} нет тарифов. ${j + 1} из ${citiesLength}`, logStateEnum.warning)
				} else {
					const cardsContainer = await driver.findElement(By.css(this._containerSelector))
					await driver.acceptCookes()

					const deltaY = (await cardsContainer.getRect()).y
					await driver.scroll(deltaY)
					await driver.sleep(500)

					await this._cardStageClass.go(driver, cardsContainer, this._cityName, regionName)

					this._logger.log(`сбор данных в ${this._cityName} завершён. ${j + 1} из ${citiesLength}`)
				}

				await driver.openRegions(this._logger)

				if (j < citiesLength - 1) {
					await driver.waitElementLocated(this._logger, selectors.regions, `cities end. City - ${this._cityName}`, async () => await driver.openRegions(this._logger))
					const currentRegion = (await driver.findArray(selectors.regions))[i]
					await currentRegion.click()
					await driver.sleep(1000)
				}
			} catch (err) {
				throw { error: err, cityNumber: j }
			}
		}
	}
}
