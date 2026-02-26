import { WebElement } from 'selenium-webdriver'
import { IDriverService } from '../../services/driver/i-driver-service'
import { cancelationTokenType } from '../root/root-stage-models'

export interface ICardStage {
	go(driver: IDriverService, cardsContainer: WebElement, cityName: string, regionName: string, cancelationToken: cancelationTokenType): Promise<void>
}

export interface ICardStageCtor {
	new (): ICardStage
}
