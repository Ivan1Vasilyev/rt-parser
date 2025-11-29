import { WebElement } from 'selenium-webdriver'
import { ILoggerService } from '../logger/i-logger-service'

const delegatedMethodNames = ['get', 'maximize', 'sleep', 'findElements', 'findElement', 'wait', 'quit', 'refresh', 'scroll'] as const
type PromiseMethods<T extends readonly string[]> = {
	[K in T[number]]: (...args: any[]) => Promise<any>
}

type driverDelegatedMethods = PromiseMethods<typeof delegatedMethodNames>

export interface IDriverService extends driverDelegatedMethods {
	findArray(selector: string, webElement?: WebElement): Promise<WebElement[]>
	getText(webElement: WebElement, selector: string): Promise<string>
	goNextCity(logger: ILoggerService, region: WebElement, regionIndex?: number): Promise<void>
	unsafeFind(selector: string, index?: number): Promise<WebElement>
	acceptCookes(): Promise<void>
	waitElementLocated(logger: ILoggerService, selector: string, place: string, action?: Function): Promise<void>
	clickCurrentCity(logger: ILoggerService): Promise<void>
	openRegions(logger: ILoggerService): Promise<void>
}
