import DriverExtention from '../../extentions/driver-extention.js'
import selectors from '../../utils/selectors.js'

export default class RootStage {
	constructor({ url, regionStage }) {
		this._url = url
		this._regionStage = regionStage
	}

	go = async (regionNumber, cityNumber) => {
		const driver = new DriverExtention()

		try {
			await driver.get(this._url)
			await driver.manage().window().maximize()
			await driver.sleep(2000)
			await driver.acceptCookes()
			await driver.openRegions()
			await driver.waitElementLocated(selectors.regions, 'start', async () => await driver.openRegions())

			const regionsLength = (await driver.findArray(selectors.regions)).length

			await this._regionStage.go(driver, regionsLength, regionNumber, cityNumber)

			await driver.quit()
		} catch (err) {
			const fixedRegionNumber = err.regionNumber ?? regionNumber ?? 0
			const fixedCityNumber = err.cityNumber ?? cityNumber ?? 0
			console.log('я упал...')
			console.log(err.error || err)
			console.log(`для продолжения - номер региона: ${fixedRegionNumber}, номер города: ${fixedCityNumber}`)
			if (err.error?.name === 'NoSuchWindowError') {
				console.log('было закрыто окно браузера')
			} else {
				if (err.error?.code === 'EBUSY') {
					console.log(`Был открыт файл ${FILE_NAME}dd.mm.yyyy.xlsx в момент внесения записи`)
				}
				await driver.quit()
				this.go(fixedRegionNumber, fixedCityNumber)
			}
		}
	}
}
