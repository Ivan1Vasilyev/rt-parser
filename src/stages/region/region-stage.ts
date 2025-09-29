import { IRegionStage } from './i-region-stage'
import selectors from '../../utils/selectors'
import { ICityStage } from '../city/i-city-stage'
import DriverExtention from '../../extentions/driver/driver-extention'

export default class RegionStage implements IRegionStage {
	private _cityStage: ICityStage
	constructor(cityStage: ICityStage) {
		this._cityStage = cityStage
	}

	go = async (driver: DriverExtention, regionsLength: number, regionNumber: number | undefined, cityNumber: number | undefined) => {
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

				await this._cityStage.go(driver, citiesLength, regionName, i, regionNumber, cityNumber)

				console.log(`сбор данных по региону ${regionName} завершён`, `${i + 1} из ${regionsLength}`)
			} catch (err: any) {
				throw { error: err.error || err, regionNumber: i, cityNumber: err.cityNumber || cityNumber }
			}
		}
	}
}
