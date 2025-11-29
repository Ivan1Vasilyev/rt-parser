import { WebElement } from 'selenium-webdriver'
import { IDriverService } from '../../services/driver/i-driver-service'

export interface ICardStage {
	go(driver: IDriverService, cardsContainer: WebElement, cityName: string, regionName: string): Promise<void>
}

export interface ICardStageCtor {
	new (): ICardStage
}
