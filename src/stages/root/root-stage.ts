import DriverExtention from '../../extentions/driver/driver-extention'
import XlsxExtention from '../../extentions/xlsx/xlsx-extention'
import { ClusterNamesType } from '../../services/cluster/cluster-service'
import Logger from '../../services/logger/log-service'
import selectors from '../../utils/selectors'
import { ICardStageCtor } from '../card/i-card-stage'
import { ICityStageCtor } from '../city/i-city-stage'
import { IRegionStage, IRegionStageCtor } from '../region/i-region-stage'

export type wayConfig = {
	path: string
	regionStageClass: IRegionStageCtor
	cityStageClass: ICityStageCtor
	cardsStageClass: ICardStageCtor
	logger: Logger
	fileName: string
	clusterName: ClusterNamesType | undefined
}

export default class RootStage {
	private _path: string
	private _fileName: string
	private _regionStage: IRegionStage
	private _logger: Logger
	constructor({ path, regionStageClass, cityStageClass, cardsStageClass, fileName, clusterName, logger }: wayConfig) {
		this._path = path
		this._fileName = fileName
		this._logger = logger
		this._regionStage = new regionStageClass(new cityStageClass(new cardsStageClass(new XlsxExtention(fileName)), logger), logger, clusterName)
	}

	go = async (regionNumber?: number | undefined, cityNumber?: number | undefined) => {
		const driver = new DriverExtention()

		try {
			await driver.get(`https://rt.ru/${this._path}`)
			await driver.maximize()
			await driver.sleep(2000)
			await driver.acceptCookes()
			await driver.openRegions(this._logger)
			await driver.waitElementLocated(this._logger, selectors.regions, 'start', async () => await driver.openRegions(this._logger))

			const regionsLength = (await driver.findArray(selectors.regions)).length

			await this._regionStage.go(driver, regionsLength, regionNumber, cityNumber)

			await driver.quit()
		} catch (err: any) {
			const fixedRegionNumber = err.regionNumber ?? regionNumber ?? 0
			const fixedCityNumber = err.cityNumber ?? cityNumber ?? 0
			this._logger.log('я упал...')
			this._logger.log(err.error || err)
			this._logger.log(`для продолжения - номер региона: ${fixedRegionNumber}, номер города: ${fixedCityNumber}`)
			if (err.error?.name === 'NoSuchWindowError') {
				this._logger.log('было закрыто окно браузера')
			} else {
				if (err.error?.code === 'EBUSY') {
					this._logger.log(`В момент внесения записи файл ${this._fileName} был открыт`)
				}
				await driver.quit()
				this.go(fixedRegionNumber, fixedCityNumber)
			}
		}
	}
}
