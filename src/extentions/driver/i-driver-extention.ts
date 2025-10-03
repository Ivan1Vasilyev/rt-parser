import { WebElement } from 'selenium-webdriver'
import Logger from '../../services/logger/log-service'

const asyncMethodNames = ['get', 'maximize', 'sleep', 'findElements', 'findElement', 'wait', 'quit', 'refresh', 'scroll'] as const
type PromiseMethods<T extends readonly string[]> = {
	[K in T[number]]: (...args: any[]) => Promise<any>
}

type driverExtentionAsyncMethods = PromiseMethods<typeof asyncMethodNames>

export interface IDriverExtention extends driverExtentionAsyncMethods {
	findArray(selector: string, webElement?: WebElement): Promise<WebElement[]>
	getText(webElement: WebElement, selector: string): Promise<string>
	goNextCity(logger: Logger, region: WebElement, regionIndex?: number): Promise<void>
	unsafeFind(selector: string, index?: number): Promise<WebElement>
	acceptCookes(): Promise<void>
	waitElementLocated(logger: Logger, selector: string, place: string, action?: Function): Promise<void>
	clickCurrentCity(logger: Logger): Promise<void>
	openRegions(logger: Logger): Promise<void>
}
