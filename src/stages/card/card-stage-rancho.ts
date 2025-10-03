import CardStageInternet from './card-stage-internet'
import DriverExtention from '../../extentions/driver/driver-extention'
import { WebElement } from 'selenium-webdriver'

export default class CardStageRancho extends CardStageInternet {
	protected override _setStep = () => false

	protected override _getTariffName = async (driver: DriverExtention, card: WebElement): Promise<string> => {
		const tariffName = await driver.getText(card, this._tariffNameSelector)
		return tariffName.includes('Свой дом') ? tariffName : `${tariffName}. Свой дом`
	}
}
