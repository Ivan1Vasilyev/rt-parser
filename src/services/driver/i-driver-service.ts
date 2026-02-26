import { Locator, WebElement, WebElementCondition, WebElementPromise } from 'selenium-webdriver'
import { ILoggerService } from '../logger/i-logger-service'

export interface IDriverService {
	// методы, делегированные из WebDriver
	get(url: string): Promise<void>
	maximize(): Promise<void>
	sleep(bound: number): Promise<void>
	findElements(locator: Locator): Promise<WebElement[]>
	findElement(locator: Locator): Promise<WebElement>
	wait(condition: WebElementCondition, timeout?: number, message?: string, pollTimeout?: number): Promise<WebElement>
	quit(): Promise<void>
	refresh(): Promise<void>
	scroll(deltaY: number): Promise<unknown>
	// кастомные
	findArray(selector: string, webElement?: WebElement): Promise<WebElement[]>
	getText(webElement: WebElement, selector: string): Promise<string>
	goNextCity(logger: ILoggerService, region: WebElement, regionIndex?: number): Promise<void>
	unsafeFind(selector: string, index?: number): Promise<WebElement>
	acceptCookes(): Promise<void>
	waitElementLocated(logger: ILoggerService, selector: string, place: string, action?: Function): Promise<void>
	waitCities(logger: ILoggerService, index: number, place: string): Promise<void>
	clickCurrentCity(logger: ILoggerService): Promise<void>
	openRegions(logger: ILoggerService): Promise<void>
}
