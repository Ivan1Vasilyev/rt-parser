import { IDriverService } from '../../services/driver/i-driver-service'
import CardStageInternet from './card-stage-internet'
import { WebElement } from 'selenium-webdriver'

export default class CardStageRancho extends CardStageInternet {
	protected override _setStep = () => false

	protected override _getTariffName = async (driver: IDriverService, card: WebElement): Promise<string> => {
		const tariffName = await super._getTariffName(driver, card)
		return tariffName.includes('Свой дом') ? tariffName : `${tariffName}. Свой дом`
	}
}
