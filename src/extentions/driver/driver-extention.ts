import { By, until, Builder, Browser, ThenableWebDriver, WebElement, Locator, WebElementCondition } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import selectors from '../../utils/selectors'
import { IDriverExtention } from './i-driver-extention'
import Logger, { logStateEnum } from '../../services/logger/log-service'

export default class DriverExtention implements IDriverExtention {
	private _driver: ThenableWebDriver

	constructor() {
		const options = new chrome.Options()
		options.setPageLoadStrategy('eager')
		this._driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build()
	}

	findElements = async (locator: Locator) => await this._driver.findElements(locator)
	findElement = async (locator: Locator) => await this._driver.findElement(locator)

	sleep = async (bound: number) => await this._driver.sleep(bound)

	wait = async (condition: WebElementCondition, timeout?: number, message?: string, pollTimeout?: number) =>
		await this._driver.wait(condition, timeout, message, pollTimeout)

	quit = async () => await this._driver.quit()

	scroll = async (deltaY: number) => await this._driver.executeScript(`window.scrollBy(0, ${deltaY});`)

	refresh = async () => await this._driver.navigate().refresh()

	get = async (url: string) => await this._driver.get(url)

	maximize = async () => await this._driver.manage().window().maximize()

	findArray = async (selector: string, webElement: WebElement | DriverExtention = this) => {
		const array = [...(await webElement.findElements(By.css(selector)))]
		return array
	}

	getText = async (webElement: WebElement, selector: string) => {
		const elems = await this.findArray(selector, webElement)
		if (elems.length) {
			const text = await elems[0].getText()
			return text
		}

		return ''
	}

	goNextCity = async (logger: Logger, region: WebElement, regionIndex?: number) => {
		await region.click()
		await this.sleep(3000)
		await this.waitElementLocated(logger, selectors.cities, 'cities', async () => {
			await this.openRegions(logger)
			await this.waitElementLocated(logger, selectors.regions, 'regions', async () => await this.openRegions(logger))
			const region = await this.unsafeFind(selectors.regions, regionIndex)
			await region.click()
		})
	}

	unsafeFind = async (selector: string, index = 0) => {
		const array = await this.findArray(selector)

		if (array.length && array[index]) {
			return array[index]
		} else {
			if (array.length) {
				console.log(`всего элементов ${array.length}`)
			} else {
				console.log(`нет элемента`)
			}

			throw `не найден элемент по селектору ${selector}${index ? `, индексу ${index}` : ''}.`
		}
	}

	acceptCookes = async () => {
		const cookieConfirm = await this.findArray(selectors.cookieConfirm)

		if (cookieConfirm.length) {
			await cookieConfirm[0].click()
			await this.sleep(500)
		}
	}

	navigate = () => this._driver.navigate()

	waitElementLocated = async (logger: Logger, selector: string, place: string, action: Function) => {
		while (true) {
			try {
				const isElementLocated = await this.wait(until.elementLocated(By.css(selector)), 50000)
				if (isElementLocated) break
			} catch (e) {
				await this.navigate().refresh()
				logger.log(`refreshed in ${place}`, logStateEnum.warning)
				await this.sleep(5000)
				if (action) {
					await action()
				} else {
					continue
				}
			}
		}
	}

	clickCurrentCity = async (logger: Logger) => {
		await this.waitElementLocated(logger, selectors.currentCity, 'currentCity', async () => await this.navigate().refresh())
		const currentCity = await this.unsafeFind(selectors.currentCity)
		await currentCity.click()
		await this.sleep(2000)
	}

	openRegions = async (logger: Logger) => {
		await this.clickCurrentCity(logger)
		await this.waitElementLocated(logger, selectors.regionsButton, 'regionsButton', async () => await this.clickCurrentCity(logger))
		const regionsButton = await this.unsafeFind(selectors.regionsButton)
		await regionsButton.click()
		await this.sleep(2000)
	}
}
