import { By, until, Builder, Browser, ThenableWebDriver, WebElement, Locator, WebElementCondition } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import selectors from '../../utils/selectors'
import { ILoggerService, logStateEnum } from '../logger/i-logger-service'
import { IDriverService } from './i-driver-service'

// на каждый Way свой экземпляр
const createDriver = (): IDriverService => new DriverService()
export default createDriver

class DriverService implements IDriverService {
	private _driver: ThenableWebDriver

	constructor() {
		const options = new chrome.Options()
		options.setPageLoadStrategy('eager')
		options.addArguments('--log-level=3')
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

	findArray = async (selector: string, webElement: WebElement | DriverService = this) => {
		const array = [...(await webElement.findElements(By.css(selector)))]
		return array
	}

	getText = async (webElement: WebElement, selector: string) => {
		const elem = await this.safeFind(selector, webElement)
		if (elem) {
			const text = await elem.getText()
			return text
		}

		return ''
	}

	goNextCity = async (logger: ILoggerService, region: WebElement, regionIndex?: number) => {
		await region.click()
		await this.sleep(3000)
		await this.waitElementLocated(logger, selectors.cities, 'goNextCity города', async () => {
			await this.openRegions(logger)
			await this.waitElementLocated(logger, selectors.regions, 'goNextCity регионы', async () => await this.openRegions(logger))
			const region = await this.unsafeFind(selectors.regions, regionIndex)
			await region.click()
		})
	}

	safeFind = async (selector: string, webElement?: WebElement) => {
		const target = await this.findArray(selector, webElement)
		return target[0]
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

			throw new Error(`не найден элемент по селектору ${selector}${index ? `, индексу ${index}` : ''}.`)
		}
	}

	acceptCookes = async () => {
		const cookieConfirm = await this.findArray(selectors.cookieConfirm)

		if (cookieConfirm.length) {
			await cookieConfirm[0].click()
			await this.sleep(500)
		}
	}

	closePopup = async () => {
		const popupButton = await this.findArray(selectors.popupCloseButton)

		if (popupButton.length) {
			await popupButton[0].click()
			await this.sleep(500)
		}
	}

	waitElementLocated = async (logger: ILoggerService, selector: string, place: string, action: Function) => {
		while (true) {
			try {
				const isElementLocated = await this.wait(until.elementLocated(By.css(selector)), 10000)
				if (isElementLocated) break
			} catch (e) {
				await this.refresh()
				await logger.log(`Перезагрузка. Место: ${place}`, logStateEnum.warning)
				await this.sleep(5000)
				await action()
			}
		}
	}

	waitCities = async (logger: ILoggerService, index: number, place: string) => {
		// Ждём загрузки городов.
		await this.waitElementLocated(logger, selectors.cities, `города в ${place}`, async () => {
			// Если не дождались, страница обновляется, снова открываем регионы
			await this.openRegions(logger)
			//  Ждём загрузки регионов (и переоткрываем их, если не дождались)
			await this.waitElementLocated(logger, selectors.regions, `регионы в ${place}`, async () => await this.openRegions(logger))
			const region = await this.unsafeFind(selectors.regions, index)
			await region.click()
		})
	}

	clickCurrentCity = async (logger: ILoggerService) => {
		await this.waitElementLocated(logger, selectors.currentCity, 'currentCity кнопка', async () => await this.refresh())
		const currentCity = await this.unsafeFind(selectors.currentCity)
		await currentCity.click()
		await this.sleep(2000)
	}

	openRegions = async (logger: ILoggerService) => {
		await this.clickCurrentCity(logger)
		await this.waitElementLocated(logger, selectors.regionsButton, 'openRegions кнопка', async () => await this.clickCurrentCity(logger))
		const regionsButton = await this.unsafeFind(selectors.regionsButton)
		await regionsButton.click()
		await this.sleep(2000)
	}
}
