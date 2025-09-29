import DriverExtention from '../../extentions/driver/driver-extention'
import selectors from '../../utils/selectors'
import { IRegionStage } from '../region/i-region-stage'

export type wayConfig = {
	url: string
	regionStage: IRegionStage
}

export default class RootStage {
	private _url: string
	private _regionStage: IRegionStage
	constructor(config: wayConfig) {
		this._url = config.url
		this._regionStage = config.regionStage
	}

	go = async (regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		const driver = new DriverExtention()

		try {
			await driver.get(this._url)
			await driver.maximize()
			await driver.sleep(2000)
			await driver.acceptCookes()
			await driver.openRegions()
			await driver.waitElementLocated(selectors.regions, 'start', async () => await driver.openRegions())

			const regionsLength = (await driver.findArray(selectors.regions)).length

			await this._regionStage.go(driver, regionsLength, regionNumber, cityNumber)

			await driver.quit()
		} catch (err: any) {
			const fixedRegionNumber = err.regionNumber ?? regionNumber ?? 0
			const fixedCityNumber = err.cityNumber ?? cityNumber ?? 0
			console.log('я упал...')
			console.log(err.error || err)
			console.log(`для продолжения - номер региона: ${fixedRegionNumber}, номер города: ${fixedCityNumber}`)
			if (err.error?.name === 'NoSuchWindowError') {
				console.log('было закрыто окно браузера')
			} else {
				if (err.error?.code === 'EBUSY') {
					// console.log(`Был открыт файл ${FILE_NAME}dd.mm.yyyy.xlsx в момент внесения записи`)
				}
				await driver.quit()
				this.go(fixedRegionNumber, fixedCityNumber)
			}
		}
	}
}
