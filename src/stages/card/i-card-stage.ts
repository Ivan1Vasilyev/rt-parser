import { WebElement } from 'selenium-webdriver'
import DriverExtention from '../../extentions/driver/driver-extention'
import XlsxExtention from '../../extentions/xlsx/xlsx-extention'

export interface ICardStage {
	go(driver: DriverExtention, cardsContainer: WebElement, cityName: string, regionName: string): Promise<void>
}

export interface ICardStageCtor {
	new (xlsx: XlsxExtention): ICardStage
}
