import CardStageInternet from './card-stage-internet'
import DriverService from '../../services/driver/driver-service'
import { WebElement } from 'selenium-webdriver'

export default class CardStageRancho extends CardStageInternet {
	protected override _setStep = () => false

	protected override _getTariffName = async (driver: DriverService, card: WebElement): Promise<string> => {
		const tariffName = await driver.getText(card, this._tariffNameSelector)
		return tariffName.includes('Свой дом') ? tariffName : `${tariffName}. Свой дом`
	}
}
