import { By } from 'selenium-webdriver'
import selectors from '../../utils/selectors.js'

export default class CityStage {
	constructor(CardStageClass) {
		this._cardStageClass = CardStageClass
	}

	go = async (driver, citiesLength, cityNumber, regionName, regionNumber, i) => {
		let refreshed = false
		let cityName
		for (let j = 0; j < citiesLength; j++) {
			try {
				if (regionNumber === i && cityNumber > j) j = cityNumber

				if (refreshed) {
					await driver.waitElementLocated(selectors.currentCity, 'currentCity after refresh', async () => await driver.navigate().refresh())

					refreshed = false
				} else {
					await driver.waitElementLocated(selectors.regions, 'regions', async () => await driver.openRegions())
					await driver.waitElementLocated(selectors.cities, 'cities', async () => {
						await driver.openRegions()
						await driver.waitElementLocated(selectors.regions, 'regions after cities', async () => await driver.openRegions())
						const region = await driver.unsafeFind(selectors.regions, i)
						await region.click()
					})

					const city = await driver.unsafeFind(selectors.cities, j)
					cityName = await city.getText()

					await city.click()
				}

				await driver.sleep(700)

				let noData,
					tariffs,
					counter = 0

				while (true) {
					noData = await driver.findArray(selectors.noData)
					tariffs = await driver.findArray(selectors.tariffs)

					if (!tariffs.length && !noData.length) {
						await driver.sleep(1000)
						counter++
					}

					if (tariffs.length || noData.length) break

					if (counter > 8) {
						await driver.navigate().refresh()
						console.log(`refreshed in loading tariffs. City: ${cityName}`)
						refreshed = true
						counter = 0
						j--
						await driver.sleep(1000)
						break
					}
				}

				if (refreshed) continue

				if (!noData.length) {
					const cardsContainer = await driver.findElement(By.css(selectors.container))

					await driver.acceptCookes()

					const deltaY = (await cardsContainer.getRect()).y
					await driver.actions().scroll(0, 0, 0, Math.round(deltaY)).perform()
					await driver.sleep(500)

					// const {workbook, worksheet, dataDir, fileName} = xlsx
					// await cardsLoop(driver, worksheet, tariffs, cardsContainer, cityName, regionName)

					// XLSX.utils.sheet_add_json(workbook.Sheets[SHEET_NAME], worksheet)
					// XLSX.writeFileXLSX(workbook, path.join(dataDir, fileName))

					console.log(`сбор данных в ${cityName} завершён`, `${j + 1} из ${citiesLength}`)
				} else {
					console.log(`в ${cityName} нет тарифов`, `${j + 1} из ${citiesLength}`)
				}

				await driver.openRegions()

				if (j < citiesLength - 1) {
					await driver.waitElementLocated(selectors.regions, `cities end. City - ${cityName}`, async () => await driver.openRegions())
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
