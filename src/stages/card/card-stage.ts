import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import { ICardStage } from './i-card-stage'
import selectors from '../../utils/selectors'
import clustersService from '../../services/cluster/cluster-service'
import { IXlsxExtention } from '../../extentions/xlsx/i-xlsx-extention'

export default class CardStage implements ICardStage {
	private _xlsx: IXlsxExtention
	constructor(xlsx: IXlsxExtention) {
		this._xlsx = xlsx
	}

	go = async (driver: DriverExtention, tariffs: WebElement[], cardsContainer: WebElement, cityName: string, regionName: string) => {
		for (let l = 0; l < tariffs.length; l++) {
			const currentTariffData = this._xlsx.getTemplate()
			// const [priceWithDiscount, price] = await parsePrices(tariffs[l]);
			// const [tariffInfo, routerForRent, TVBoxForRent, TVBoxToBuy] = await parseTariffInfo(driver, tariffs[l]);
			// const [discountDuration, priceInfo, discountMark] = await parsePriceAndDiscountInfo(tariffs[l], tariffInfo);
			// const [speed, interactiveTV, GB, minutes, SMS] = await parseOffers(tariffs[l]);
			const tariffName = await driver.getText(tariffs[l], selectors.tariffName)

			if (!tariffName.trim()) throw 'нет навания тарифа'

			currentTariffData[this._xlsx.KEYS.cityName] = cityName
			currentTariffData[this._xlsx.KEYS.tariffName] = tariffName
			// currentTariffData[KEYS.priceWithDiscount] = priceWithDiscount;
			// currentTariffData[KEYS.price] = price;
			// currentTariffData[KEYS.discountDuration] = discountDuration;
			// currentTariffData[KEYS.priceInfo] = priceInfo;
			// currentTariffData[KEYS.discountMark] = discountMark;
			// currentTariffData[KEYS.tariffInfo] = tariffInfo;
			// currentTariffData[KEYS.routerForRent] = routerForRent;
			// currentTariffData[KEYS.TVBoxForRent] = TVBoxForRent;
			// currentTariffData[KEYS.TVBoxToBuy] = TVBoxToBuy;
			// currentTariffData[KEYS.speed] = speed;
			// currentTariffData[KEYS.interactiveTV] = interactiveTV;
			// currentTariffData[KEYS.GB] = GB;
			// currentTariffData[KEYS.minutes] = minutes;
			// currentTariffData[KEYS.SMS] = SMS;
			currentTariffData[this._xlsx.KEYS.region] = regionName
			currentTariffData[this._xlsx.KEYS.cluster] = clustersService.getCluster(regionName)

			this._xlsx.push(currentTariffData)

			const tariffsArrow = (await driver.findArray(selectors.tariffsArrow, cardsContainer))[0]
			if (tariffsArrow && ((l > 1 && l <= tariffs.length - 4) || (tariffs.length < 14 && l > 0))) {
				await tariffsArrow.click()
				await driver.sleep(2000)
			}
		}
	}
}
