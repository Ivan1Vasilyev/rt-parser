import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import { ICardStage } from '../models/i-card-stage'
import selectors from '../../utils/selectors'
import clustersService from '../../services/cluster/cluster-service'
import xslxService from '../../extentions/xlsx/xlsx-extention'
import { tariffDataKeysEnum, tariffDataType } from '../../extentions/models/i-xlsx-extention'

export default class CardStage implements ICardStage {
	protected _oldPriceSelector: string = selectors.oldPriceValue
	protected _priceSelector: string = selectors.priceValue
	protected _tariffNameSelector: string = selectors.tariffName
	protected _discountRegex = new RegExp(/скидк[уа]\s(\d{1,2}%\s)?на\s(\d{1,2})\s(дней|месяц[а(ев)]?)/i)

	constructor() {}

	protected _getDigits = (str: string): string => {
		const digits = str.match(/\d+/g)
		if (digits) return digits[0]
		return ''
	}

	protected _parsePrices = async (driver: DriverExtention, card: WebElement): Promise<string[]> => {
		const oldPriceValue = (await driver.getText(card, this._oldPriceSelector))?.replace(/\s/g, '')
		const priceValue = (await driver.getText(card, this._priceSelector))?.replace(/\s/g, '')
		return oldPriceValue && priceValue !== '' ? [priceValue, oldPriceValue] : ['', oldPriceValue || priceValue]
	}

	protected _parseTariffInfo = async (driver: DriverExtention, card: WebElement): Promise<string[]> => {
		let tariffInfo = ''
		let routerForRent = ''
		let TVBoxForRent = ''
		let TVBoxToBuy = ''
		const addText = (info: string) => {
			if (/роутер/i.test(info)) {
				const splittedInfo = info.split('\n')
				routerForRent = this._getDigits(splittedInfo[0])
				if (splittedInfo.length > 1 && /приставка/i.test(splittedInfo[1])) {
					TVBoxForRent = this._getDigits(splittedInfo[1])
				}
				return
			}
			if (/тв-приставка/i.test(info)) {
				TVBoxToBuy = this._getDigits(info)
			}
			tariffInfo += info ? `${info} ` : ''
		}

		const iterateInInfo = async (button?: WebElement) => {
			if (button) {
				await button.click()
				await driver.sleep(1000)
			}

			const info = await driver.getText(card, selectors.info)

			addText(info)
		}

		const isInfoExists = await driver.findArray(selectors.info, card)
		if (!isInfoExists.length) {
			return [tariffInfo.trim(), routerForRent, TVBoxForRent]
		}

		await iterateInInfo()

		const goByArrow = await driver.findArray(selectors.goByArrow, card)

		if (goByArrow.length) {
			while (true) {
				const arrow = (await driver.findArray(selectors.arrow, card))[0]
				if (!arrow) break
				await iterateInInfo(arrow)
			}
		}

		const goByTitles = await driver.findArray(selectors.goByTitles, card)

		if (goByTitles.length) {
			for (let i = 0; i < goByTitles.length; i++) {
				await iterateInInfo(goByTitles[i])
			}
		}

		return [tariffInfo.trim(), routerForRent, TVBoxForRent, TVBoxToBuy]
	}

	protected _parsePriceAndDiscountInfo = async (driver: DriverExtention, card: WebElement, tariffInfo: string): Promise<string[]> => {
		const discountMark = (await driver.findArray(selectors.discountMarkText, card))[0]
		if (discountMark) {
			const discountMarkText = await discountMark.getText()
			let buttonText = (await driver.getText(card, selectors.buttonText)).trim()

			buttonText = /подключить/i.test(buttonText) ? '' : buttonText
			let priceInfo = discountMarkText.length > 1 && !/топ/i.test(discountMarkText) ? `${buttonText || 'Скидка:'} ${discountMarkText}` : buttonText
			const discountDuration = /месяц/i.test(buttonText) ? this._getDigits(buttonText) : ''
			if (!priceInfo) {
				const matches = tariffInfo.match(this._discountRegex)
				if (matches) {
					priceInfo = `${matches[2] || ''} ${matches[3] || ''} со скидкой ${matches[1] || ''}`
				}
			}

			return [discountDuration, priceInfo.trim(), '1']
		}
		return ['', '', '']
	}

	protected _parseOffers = async (driver: DriverExtention, card: WebElement): Promise<string[]> => {
		let speed, interactiveTV, GB, minutes, SMS
		const offers = await driver.findArray(selectors.offers, card)

		for (const offer of offers) {
			const offerName = await driver.getText(offer, selectors.offerName)
			const offerText = await driver.getText(offer, selectors.offerText)

			if (/интернет/i.test(offerName)) {
				const speedText = this._getDigits(offerText.replace(/\s/g, ''))
				speed = /не включено/i.test(speedText) ? '' : speedText
				continue
			}
			if (/Интерактивное ТВ/i.test(offerName)) {
				interactiveTV = this._getDigits(offerText)
				continue
			}
			if (/Мобильная связь/i.test(offerName)) {
				if (/не включено/i.test(offerText)) {
					;[GB, minutes, SMS] = ['', '', '']
				} else {
					;[GB, minutes, SMS] = offerText.match(/\d+/g) ?? []
				}
			}
		}
		return [speed || '', interactiveTV || '', GB || '', minutes || '', SMS || '']
	}

	protected _getTariffName = async (driver: DriverExtention, webElement: WebElement): Promise<string> => {
		return await driver.getText(webElement, this._tariffNameSelector)
	}

	go = async (driver: DriverExtention, cardsContainer: WebElement, cityName: string, regionName: string) => {
		const tariffData = [] as tariffDataType[]
		const tariffs = await driver.findArray(selectors.tariffs)

		for (let l = 0; l < tariffs.length; l++) {
			const currentTariffData = xslxService.getTemplate()
			const [priceWithDiscount, price] = await this._parsePrices(driver, tariffs[l])
			const [tariffInfo, routerForRent, TVBoxForRent, TVBoxToBuy] = await this._parseTariffInfo(driver, tariffs[l])
			const [discountDuration, priceInfo, discountMark] = await this._parsePriceAndDiscountInfo(driver, tariffs[l], tariffInfo)
			const [speed, interactiveTV, GB, minutes, SMS] = await this._parseOffers(driver, tariffs[l])
			const tariffName = await this._getTariffName(driver, tariffs[l])

			if (!tariffName.trim()) throw 'нет навания тарифа'

			currentTariffData[tariffDataKeysEnum.cityName] = cityName
			currentTariffData[tariffDataKeysEnum.tariffName] = tariffName
			currentTariffData[tariffDataKeysEnum.priceWithDiscount] = priceWithDiscount
			currentTariffData[tariffDataKeysEnum.price] = price
			currentTariffData[tariffDataKeysEnum.discountDuration] = discountDuration
			currentTariffData[tariffDataKeysEnum.priceInfo] = priceInfo
			currentTariffData[tariffDataKeysEnum.discountMark] = discountMark
			currentTariffData[tariffDataKeysEnum.tariffInfo] = tariffInfo
			currentTariffData[tariffDataKeysEnum.routerForRent] = routerForRent
			currentTariffData[tariffDataKeysEnum.TVBoxForRent] = TVBoxForRent
			currentTariffData[tariffDataKeysEnum.TVBoxToBuy] = TVBoxToBuy
			currentTariffData[tariffDataKeysEnum.speed] = speed
			currentTariffData[tariffDataKeysEnum.interactiveTV] = interactiveTV
			currentTariffData[tariffDataKeysEnum.GB] = GB
			currentTariffData[tariffDataKeysEnum.minutes] = minutes
			currentTariffData[tariffDataKeysEnum.SMS] = SMS
			currentTariffData[tariffDataKeysEnum.region] = regionName
			currentTariffData[tariffDataKeysEnum.cluster] = clustersService.getCluster(regionName)

			tariffData.push(currentTariffData)

			const tariffsArrow = (await driver.findArray(selectors.tariffsArrow, cardsContainer))[0]
			if (tariffsArrow && ((l > 1 && l <= tariffs.length - 4) || (tariffs.length < 14 && l > 0))) {
				await tariffsArrow.click()
				await driver.sleep(2000)
			}
		}

		xslxService.writeFile(tariffData)
	}
}
