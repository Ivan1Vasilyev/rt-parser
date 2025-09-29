import { WebElement } from 'selenium-webdriver'

const asyncMethodNames = ['get', 'maximize', 'sleep', 'findElements', 'findElement', 'wait', 'quit', 'refresh', 'scroll'] as const
type PromiseMethods<T extends readonly string[]> = {
	[K in T[number]]: (...args: any[]) => Promise<any>
}

type driverExtentionAsyncMethods = PromiseMethods<typeof asyncMethodNames>

export interface IDriverExtention extends driverExtentionAsyncMethods {
	findArray(selector: string, webElement?: WebElement): Promise<WebElement[]>
	getText(webElement: WebElement, selector: string): Promise<string>
	goNextCity(region: WebElement, regionIndex?: number): Promise<void>
	unsafeFind(selector: string, index?: number): Promise<WebElement>
	acceptCookes(): Promise<void>
	waitElementLocated(selector: string, place: string, action?: Function): Promise<void>
	clickCurrentCity(): Promise<void>
	openRegions(): Promise<void>
}
