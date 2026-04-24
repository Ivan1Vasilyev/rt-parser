import { WebElement } from 'selenium-webdriver'
import { ICardStage } from './i-card-stage'
import selectors from '../../utils/selectors'
import clusterService from '../../services/cluster/cluster-service'
import { tariffDataKeysEnum, tariffDataType } from '../../services/xlsx/xlsx-models'
import xlsxService from '../../services/xlsx/xlsx-service'
import { IDriverService } from '../../services/driver/i-driver-service'
import { cancelationTokenType } from '../root/root-stage-models'

type tariffInfoType = {
	tariffInfo: string
	routerForRent: string
	TVBoxForRent: string
	TVBoxToBuy: string
}

type pricesType = {
	promoPrice: string
	price: string
}

type priceInfoType = { discountDuration: string; priceInfo: string; discountMark: string }

type offersType = { speed: string; interactiveTV: string; GB: string; minutes: string; SMS: string }

export default class CardStage implements ICardStage {
	protected _oldPriceSelector: string = selectors.oldPriceValue
	protected _priceSelector: string = selectors.priceValue
	protected _tariffNameSelector: string = selectors.tariffName
	protected _discountRegex = new RegExp(/скидк[уа]\s(\d{1,2}%\s)?на\s(\d{1,2})\s(дней|месяц[а(ев)]?)/i)

	protected _getDigits = (str: string): string => {
		const digits = str.match(/\d+/g)
		if (digits) return digits[0]
		return ''
	}

	protected _parsePrices = async (driver: IDriverService, card: WebElement): Promise<pricesType> => {
		const oldPriceValue = (await driver.getText(card, this._oldPriceSelector))?.replace(/\s/g, '')
		const priceValue = (await driver.getText(card, this._priceSelector))?.replace(/\s/g, '')

		return oldPriceValue && priceValue !== '' ? { promoPrice: priceValue, price: oldPriceValue } : { promoPrice: '', price: oldPriceValue || priceValue }
	}

	protected _parseTariffInfo = async (driver: IDriverService, card: WebElement): Promise<tariffInfoType> => {
		let routerForRent = ''
		let TVBoxForRent = ''
		let TVBoxToBuy = ''

		const checkText = (info: string) => {
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
		}

		const iterateInInfo = async (infoItem: WebElement, i: number) => {
			const title = await driver.getText(infoItem, '.rt-tariff-card__info-tag')
			const text = await driver.getText(infoItem, '.rt-tariff-card__info-text')

			checkText(text)

			return `${title}: ${text}`
		}

		const infoBlock = await driver.safeFind(selectors.info, card)
		if (!infoBlock) return { tariffInfo: '', routerForRent, TVBoxForRent, TVBoxToBuy }

		const infoButton = await driver.safeFind('.rt-tariff-card__info-item--show-all', infoBlock)
		let tariffInfo = ''

		if (infoButton) {
			await infoButton.click()
			await driver.sleep(300)
			const infoItems = await driver.findArray('.card-info-dialog .rt-tariff-card__info-item')
			const infoTexts = new Set<string>()
			for (let i = 0; i < infoItems.length; i++) {
				const infoText = await iterateInInfo(infoItems[i], i)
				infoTexts.add(infoText)
			}

			tariffInfo = [...infoTexts.values()].join('<br />')
		} else {
			const infoItem = await driver.safeFind('.rt-tariff-card__info-item', infoBlock)
			if (infoItem) {
				tariffInfo = await iterateInInfo(infoItem, 100)
			}
		}

		return { tariffInfo, routerForRent, TVBoxForRent, TVBoxToBuy }
	}

	protected _parsePriceAndDiscountInfo = async (driver: IDriverService, card: WebElement): Promise<priceInfoType> => {
		let discountMark = '',
			priceInfo = ''

		const discountMarkElem = await driver.safeFind(selectors.discountMarkText, card)

		if (discountMarkElem) {
			discountMark = '1'
		}

		const priceInfoElem = await driver.safeFind('.rt-tariff-card__price-text')
		if (priceInfoElem) {
			priceInfo = await priceInfoElem.getText()
		}

		const discountDuration = /месяц/i.test(priceInfo) ? this._getDigits(priceInfo) : ''

		return { discountDuration, priceInfo: priceInfo.trim(), discountMark }
	}

	protected _parseOffers = async (driver: IDriverService, card: WebElement): Promise<offersType> => {
		let speed = '',
			interactiveTV = '',
			GB = '',
			minutes = '',
			SMS = ''
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
				if (!/не включено/i.test(offerText)) {
					;[GB = '', minutes = '', SMS = ''] = offerText.match(/\d+/g) ?? []
				}
			}
		}
		return { speed, interactiveTV, GB, minutes, SMS }
	}

	protected _getTariffName = async (driver: IDriverService, webElement: WebElement): Promise<string> => {
		return await driver.getText(webElement, this._tariffNameSelector)
	}

	go = async (driver: IDriverService, cardsContainer: WebElement, cityName: string, regionName: string, cancelationToken: cancelationTokenType) => {
		const tariffData = [] as tariffDataType[]
		const tariffs = await driver.findArray(selectors.tariffs)
		const cluster = clusterService.getClusterName(regionName)
		const tariffsArrow = await driver.safeFind(selectors.tariffsArrow, cardsContainer)

		const maxIndex = 16

		for (let i = 0; i < tariffs.length; i++) {
			if (cancelationToken.isInterrupted) return

			if (tariffsArrow && i > 2 && (tariffs.length < maxIndex || i < Math.max(tariffs.length, maxIndex) - 1)) {
				await tariffsArrow.click()
				await driver.sleep(1000)
			}

			const currentTariffData = xlsxService.getTemplate()
			const { promoPrice, price } = await this._parsePrices(driver, tariffs[i])
			const { tariffInfo, routerForRent, TVBoxForRent, TVBoxToBuy } = await this._parseTariffInfo(driver, tariffs[i])
			const { discountDuration, priceInfo, discountMark } = await this._parsePriceAndDiscountInfo(driver, tariffs[i])
			const { speed, interactiveTV, GB, minutes, SMS } = await this._parseOffers(driver, tariffs[i])
			const tariffName = await this._getTariffName(driver, tariffs[i])

			if (!tariffName.trim()) throw 'нет названия тарифа'

			currentTariffData[tariffDataKeysEnum.cityName] = cityName
			currentTariffData[tariffDataKeysEnum.tariffName] = tariffName
			currentTariffData[tariffDataKeysEnum.promoPrice] = promoPrice
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
			currentTariffData[tariffDataKeysEnum.cluster] = cluster

			tariffData.push(currentTariffData)
		}

		xlsxService.writeTariffsFile(tariffData)
	}
}
