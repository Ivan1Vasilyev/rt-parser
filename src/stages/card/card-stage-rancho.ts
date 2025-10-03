import { IXlsxExtention } from '../../extentions/xlsx/i-xlsx-extention'
import CardStageInternet from './card-stage-internet'
import DriverExtention from '../../extentions/driver/driver-extention'
import { WebElement } from 'selenium-webdriver'

export default class CardStageRancho extends CardStageInternet {
	constructor(xlsx: IXlsxExtention) {
		super(xlsx)
	}

	protected override _setStep = () => false

	protected override _getTariffName = async (driver: DriverExtention, card: WebElement): Promise<string> => {
		const tariffName = await driver.getText(card, '.landing-offer__name')
		if (tariffName.includes('Свой дом')) return tariffName
		return `${tariffName}. Свой дом`
	}
}
