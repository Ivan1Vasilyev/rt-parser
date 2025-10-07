import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'

export interface ICardStage {
	go(driver: DriverExtention, cardsContainer: WebElement, cityName: string, regionName: string): Promise<void>
}

export interface ICardStageCtor {
	new (): ICardStage
}
