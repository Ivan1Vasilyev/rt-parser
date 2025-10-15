import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import CardStage from './card-stage'
import clustersService from '../../services/cluster/cluster-service'
import xslxService from '../../extentions/xlsx/xlsx-extention'
import { tariffDataKeysEnum, tariffDataType } from '../../extentions/models/i-xlsx-extention'

export default class CardStageInternet extends CardStage {
	protected _oldPriceSelector: string = '.rt-price-v3__old-val'
	protected _priceSelector: string = '.rt-price-v3__val'
	protected _tariffNameSelector: string = '.landing-offer__name'

	protected override _parsePriceAndDiscountInfo = async (driver: DriverExtention, button: WebElement) => {
		const priceInfoElem = await driver.findArray('.landing-form-card__desc', button)
		if (priceInfoElem.length) {
			const priceInfo = await priceInfoElem[0].getText()
			const matches = priceInfo.match(this._discountRegex)
			if (matches) {
				const resultPriceInfo = `${matches[2] || ''} ${matches[3] || ''} со скидкой ${matches[1] || ''}`
				const discountDuration = /месяц/i.test(priceInfo) ? matches[3] : ''
				return { discountDuration, priceInfo: resultPriceInfo, discountMark: '1' }
			}
			return { discountDuration: '', priceInfo, discountMark: '' }
		}

		return { discountDuration: '', priceInfo: '', discountMark: '' }
	}

	protected override _parseTariffInfo = async (driver: DriverExtention, container: WebElement) => {
		let tariffInfo = ''

		const addText = (info: string) => {
			tariffInfo += info ? `${info} ` : ''
		}

		const actionHead = await driver.findArray('.landing-offer > .d-flex .font-t-s', container)
		if (actionHead.length) {
			const actionHeadText = await actionHead[0].getText()
			addText(` ${actionHeadText}: `)

			const actionText = await driver.getText(container, '.landing-offer > .d-flex .font-t-xs.color-main05')
			addText(actionText)
		}

		const videoInfo = await driver.findArray('.landing-offer__sale__wrap', container)
		if (videoInfo.length) {
			const videoHead = await (await driver.findArray('.font-t-s', videoInfo[0]))[0].getText()
			addText(` ${videoHead}: `)

			const videoText = await driver.getText(videoInfo[0], '.font-t-xs.color-main05:not(.sp-b-darkpurple)')
			addText(videoText)
		}

		return { tariffInfo: tariffInfo.trim(), routerForRent: '', TVBoxForRent: '', TVBoxToBuy: '' }
	}

	protected override _parseOffers = async (driver: DriverExtention, card: WebElement) => {
		let speed = '',
			tariffInfo = ''
		const offers = await driver.findArray('.landing-offer__product', card)

		for (const offer of offers) {
			const offerText = await driver.getText(offer, '.font-t-s')
			const offerName = await driver.getText(offer, '.font-t-xs')

			if (/интернет/i.test(offerName)) {
				const speedText = this._getDigits(offerText.replace(/\s/g, ''))
				speed = /не включено/i.test(speedText) ? '' : speedText
				continue
			}
			if (/опции/i.test(offerName)) {
				tariffInfo = ` ${offerText}`
				continue
			}
		}

		return { speed, interactiveTV: tariffInfo, GB: '', minutes: '', SMS: '' }
	}

	protected _setStep = (counter: number, maxValue: number): boolean => counter > 0 && counter < maxValue

	go = async (driver: DriverExtention, cardsContainer: WebElement, cityName: string, regionName: string) => {
		const tariffData = [] as tariffDataType[]

		const buttons = await driver.findArray('.landing-form-card', cardsContainer)
		const cluster = clustersService.getClusterName(regionName)
		if (buttons.length) {
			for (let i = 0; i < buttons.length; i++) {
				if (this._setStep(i, buttons.length - 1)) continue
				const currentTariffData = xslxService.getTemplate()

				await buttons[i].click()
				await driver.sleep(2000)

				const { promoPrice, price } = await this._parsePrices(driver, buttons[i])
				const { tariffInfo } = await this._parseTariffInfo(driver, cardsContainer)
				const { discountDuration, priceInfo, discountMark } = await this._parsePriceAndDiscountInfo(driver, buttons[i])
				const { speed, interactiveTV: tariffInfoAdd } = await this._parseOffers(driver, cardsContainer)

				const tariffName = await this._getTariffName(driver, cardsContainer)

				if (!tariffName.trim()) throw 'нет навания тарифа'

				currentTariffData[tariffDataKeysEnum.cityName] = cityName
				currentTariffData[tariffDataKeysEnum.tariffName] = tariffName
				currentTariffData[tariffDataKeysEnum.promoPrice] = promoPrice
				currentTariffData[tariffDataKeysEnum.price] = price
				currentTariffData[tariffDataKeysEnum.discountDuration] = discountDuration
				currentTariffData[tariffDataKeysEnum.priceInfo] = priceInfo
				currentTariffData[tariffDataKeysEnum.discountMark] = discountMark
				currentTariffData[tariffDataKeysEnum.discountMark] = priceInfo ? '1' : ''
				currentTariffData[tariffDataKeysEnum.tariffInfo] = tariffInfo + tariffInfoAdd
				currentTariffData[tariffDataKeysEnum.speed] = speed
				currentTariffData[tariffDataKeysEnum.region] = regionName
				currentTariffData[tariffDataKeysEnum.cluster] = cluster

				tariffData.push(currentTariffData)
			}
		} else {
			const currentTariffData = xslxService.getTemplate()

			const { promoPrice, price } = await this._parsePrices(driver, cardsContainer)
			const { tariffInfo } = await this._parseTariffInfo(driver, cardsContainer)

			const { speed, interactiveTV: tariffInfoAdd } = await this._parseOffers(driver, cardsContainer)
			const tariffName = await this._getTariffName(driver, cardsContainer)

			if (!tariffName.trim()) throw 'нет навания тарифа'

			currentTariffData[tariffDataKeysEnum.cityName] = cityName
			currentTariffData[tariffDataKeysEnum.tariffName] = tariffName
			currentTariffData[tariffDataKeysEnum.promoPrice] = promoPrice
			currentTariffData[tariffDataKeysEnum.price] = price
			currentTariffData[tariffDataKeysEnum.tariffInfo] = tariffInfo + tariffInfoAdd
			currentTariffData[tariffDataKeysEnum.speed] = speed
			currentTariffData[tariffDataKeysEnum.region] = regionName
			currentTariffData[tariffDataKeysEnum.cluster] = cluster
			tariffData.push(currentTariffData)
		}

		xslxService.writeTariffsFile(tariffData)
	}
}
