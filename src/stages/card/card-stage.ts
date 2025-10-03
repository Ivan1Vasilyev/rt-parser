import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import { ICardStage } from './i-card-stage'
import selectors from '../../utils/selectors'
import clustersService from '../../services/cluster/cluster-service'
import { IXlsxExtention } from '../../extentions/xlsx/i-xlsx-extention'

export default class CardStage implements ICardStage {
	protected _oldPriceSelector: string = selectors.oldPriceValue
	protected _priceSelector: string = selectors.priceValue
	protected _tariffNameSelector: string = selectors.tariffName

	protected _xlsx: IXlsxExtention
	constructor(xlsx: IXlsxExtention) {
		this._xlsx = xlsx
	}

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
				const matches = tariffInfo.match(/скидк[уа]\s(\d{1,2}%\s)?на\s(\d{1,2})\s(дней|месяц[а(ев)]?)/)
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
		const tariffs = await driver.findArray(selectors.tariffs)

		for (let l = 0; l < tariffs.length; l++) {
			const currentTariffData = this._xlsx.getTemplate()
			const [priceWithDiscount, price] = await this._parsePrices(driver, tariffs[l])
			const [tariffInfo, routerForRent, TVBoxForRent, TVBoxToBuy] = await this._parseTariffInfo(driver, tariffs[l])
			const [discountDuration, priceInfo, discountMark] = await this._parsePriceAndDiscountInfo(driver, tariffs[l], tariffInfo)
			const [speed, interactiveTV, GB, minutes, SMS] = await this._parseOffers(driver, tariffs[l])
			const tariffName = await this._getTariffName(driver, tariffs[l])

			if (!tariffName.trim()) throw 'нет навания тарифа'

			currentTariffData[this._xlsx.KEYS.cityName] = cityName
			currentTariffData[this._xlsx.KEYS.tariffName] = tariffName
			currentTariffData[this._xlsx.KEYS.priceWithDiscount] = priceWithDiscount
			currentTariffData[this._xlsx.KEYS.price] = price
			currentTariffData[this._xlsx.KEYS.discountDuration] = discountDuration
			currentTariffData[this._xlsx.KEYS.priceInfo] = priceInfo
			currentTariffData[this._xlsx.KEYS.discountMark] = discountMark
			currentTariffData[this._xlsx.KEYS.tariffInfo] = tariffInfo
			currentTariffData[this._xlsx.KEYS.routerForRent] = routerForRent
			currentTariffData[this._xlsx.KEYS.TVBoxForRent] = TVBoxForRent
			currentTariffData[this._xlsx.KEYS.TVBoxToBuy] = TVBoxToBuy
			currentTariffData[this._xlsx.KEYS.speed] = speed
			currentTariffData[this._xlsx.KEYS.interactiveTV] = interactiveTV
			currentTariffData[this._xlsx.KEYS.GB] = GB
			currentTariffData[this._xlsx.KEYS.minutes] = minutes
			currentTariffData[this._xlsx.KEYS.SMS] = SMS
			currentTariffData[this._xlsx.KEYS.region] = regionName
			currentTariffData[this._xlsx.KEYS.cluster] = clustersService.getCluster(regionName)

			this._xlsx.push(currentTariffData)

			const tariffsArrow = (await driver.findArray(selectors.tariffsArrow, cardsContainer))[0]
			if (tariffsArrow && ((l > 1 && l <= tariffs.length - 4) || (tariffs.length < 14 && l > 0))) {
				await tariffsArrow.click()
				await driver.sleep(2000)
			}
		}

		this._xlsx.writeFile()
	}
}
