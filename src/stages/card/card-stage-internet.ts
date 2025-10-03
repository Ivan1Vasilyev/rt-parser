import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import CardStage from './card-stage'
import clustersService from '../../services/cluster/cluster-service'
import xslxService from '../../extentions/xlsx/xlsx-extention'

export default class CardStageInternet extends CardStage {
	protected _oldPriceSelector: string = '.rt-price-v3__old-val'
	protected _priceSelector: string = '.rt-price-v3__val'
	protected _tariffNameSelector: string = '.landing-offer__name'

	protected override _parsePriceAndDiscountInfo = async (driver: DriverExtention, button: WebElement): Promise<string[]> => {
		const priceInfoElem = await driver.findArray('.landing-form-card__desc', button)
		if (priceInfoElem.length) {
			const priceInfo = await priceInfoElem[0].getText()
			const matches = priceInfo.match(/скидк[уа]\s(\d{1,2}%\s)?на\s(\d{1,2})\s(дней|месяц[а(ев)]?)/)
			if (matches) {
				const resultPriceInfo = `${matches[2] || ''} ${matches[3] || ''} со скидкой ${matches[1] || ''}`
				const discountDuration = /месяц/i.test(priceInfo) ? matches[3] : ''
				return [discountDuration, resultPriceInfo, '1']
			}
			return ['', priceInfo, '']
		}

		return ['', '', '']
	}

	protected override _parseTariffInfo = async (driver: DriverExtention, container: WebElement): Promise<string[]> => {
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

		return [tariffInfo.trim()]
	}

	protected override _parseOffers = async (driver: DriverExtention, card: WebElement): Promise<string[]> => {
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

		return [speed, tariffInfo]
	}

	protected _setStep = (counter: number, maxValue: number): boolean => counter > 0 && counter < maxValue

	go = async (driver: DriverExtention, cardsContainer: WebElement, cityName: string, regionName: string) => {
		const buttons = await driver.findArray('.landing-form-card', cardsContainer)
		const currentTariffData = xslxService.getTemplate()
		const cluster = clustersService.getCluster(regionName)
		if (buttons.length) {
			for (let l = 0; l < buttons.length; l++) {
				if (this._setStep(l, buttons.length - 1)) continue

				await buttons[l].click()
				await driver.sleep(2000)

				const [priceWithDiscount, price] = await this._parsePrices(driver, buttons[l])
				const [tariffInfo] = await this._parseTariffInfo(driver, cardsContainer)
				const [discountDuration, priceInfo, discountMark] = await this._parsePriceAndDiscountInfo(driver, buttons[l])
				const [speed, tariffInfoAdd] = await this._parseOffers(driver, cardsContainer)

				const tariffName = await this._getTariffName(driver, cardsContainer)

				currentTariffData[xslxService.KEYS.cityName] = cityName
				currentTariffData[xslxService.KEYS.tariffName] = tariffName
				currentTariffData[xslxService.KEYS.priceWithDiscount] = priceWithDiscount
				currentTariffData[xslxService.KEYS.price] = price
				currentTariffData[xslxService.KEYS.discountDuration] = discountDuration
				currentTariffData[xslxService.KEYS.priceInfo] = priceInfo
				currentTariffData[xslxService.KEYS.discountMark] = discountMark
				currentTariffData[xslxService.KEYS.discountMark] = priceInfo ? '1' : ''
				currentTariffData[xslxService.KEYS.tariffInfo] = tariffInfo + tariffInfoAdd
				currentTariffData[xslxService.KEYS.speed] = speed
				currentTariffData[xslxService.KEYS.region] = regionName
				currentTariffData[xslxService.KEYS.cluster] = cluster

				xslxService.push(currentTariffData)
			}
		} else {
			const [priceWithDiscount, price] = await this._parsePrices(driver, cardsContainer)
			const [tariffInfo] = await this._parseTariffInfo(driver, cardsContainer)

			const [speed, tariffInfoAdd] = await this._parseOffers(driver, cardsContainer)
			const tariffName = await this._getTariffName(driver, cardsContainer)

			currentTariffData[xslxService.KEYS.cityName] = cityName
			currentTariffData[xslxService.KEYS.tariffName] = tariffName
			currentTariffData[xslxService.KEYS.priceWithDiscount] = priceWithDiscount
			currentTariffData[xslxService.KEYS.price] = price
			currentTariffData[xslxService.KEYS.tariffInfo] = tariffInfo + tariffInfoAdd
			currentTariffData[xslxService.KEYS.speed] = speed
			currentTariffData[xslxService.KEYS.region] = regionName
			currentTariffData[xslxService.KEYS.cluster] = cluster
			xslxService.push(currentTariffData)
		}

		xslxService.writeFile()
	}
}
