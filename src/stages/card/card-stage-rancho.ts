import { IXlsxExtention } from '../../extentions/xlsx/i-xlsx-extention'
import CardStageInternet from './card-stage-internet'
import DriverExtention from '../../extentions/driver/driver-extention'
import { By, WebElement } from 'selenium-webdriver'

export default class CardStageRancho extends CardStageInternet {
	constructor(xlsx: IXlsxExtention) {
		super(xlsx)
	}

	protected override _setStep = () => false

	protected override _getTariffName = async (driver: DriverExtention, card: WebElement): Promise<string> => {
		const tariffName = await driver.getText(card, this._tariffNameSelector)
		return tariffName.includes('Свой дом') ? tariffName : `${tariffName}. Свой дом`
	}
}
