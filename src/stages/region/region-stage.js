import selectors from '../../utils/selectors.js'

export default class RegionStage {
	constructor(cityStage) {
		this._cityStage = cityStage
	}

	go = async (driver, regionsLength, regionNumber, cityNumber) => {
		for (let i = 0; i < regionsLength; i++) {
			if (regionNumber && regionNumber > i) i = regionNumber

			try {
				await driver.waitElementLocated(selectors.regions, 'regions', async () => await driver.openRegions())

				const region = await driver.unsafeFind(selectors.regions, i)
				const regionName = await region.getText()

				// if (!northEastCenterMoscowRegions.some((r) => regionName.includes(r))) continue
				console.log('регион: ' + regionName)

				await region.click()
				await driver.sleep(3000)
				await driver.waitElementLocated(selectors.cities, 'cities', async () => {
					await driver.openRegions()
					await driver.waitElementLocated(selectors.regions, 'regions', async () => await driver.openRegions())
					const region = await driver.unsafeFind(selectors.regions, i)
					await region.click()
				})
				const citiesLength = (await driver.findArray(selectors.cities)).length
				if (citiesLength == 0) {
					console.log(`В регионе ${regionName} не загрузились города`)
					console.log(`Индекс региона: ${i}`)

					await driver.navigate().refresh()
					await driver.sleep(3000)
					await driver.openRegions()

					i--
					continue
				}

				await this._cityStage.go(driver, citiesLength, cityNumber, regionName, regionNumber, i)

				console.log(`сбор данных по региону ${regionName} завершён`, `${i + 1} из ${regionsLength}`)
			} catch (err) {
				throw { error: err.error || err, regionNumber: i, cityNumber: err.cityNumber || cityNumber }
			}
		}
	}
}
