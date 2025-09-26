import { By, until, Builder, Browser } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import selectors from '../utils/selectors.js'

export default class DriverExtention {
	_asyncDelegats = ['get', 'maximize', 'sleep', 'findElements', 'findElement', 'wait', 'quit', 'refresh', 'perform']
	_delegats = ['manage', 'navigate', 'window', 'actions', 'scroll']

	constructor() {
		const options = new chrome.Options().setPageLoadStrategy('eager')
		this._driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build()

		this._asyncDelegats.forEach(i => (this[i] = async (...args) => this._driver[i](...args)))
		this._delegats.forEach(i => (this[i] = (...args) => this._driver[i](...args)))
	}

	findArray = async function (selector, webElement = this) {
		const array = [...(await webElement.findElements(By.css(selector)))]
		return array
	}

	getText = async selector => {
		const elems = await this.findArray(selector)
		if (elems.length) {
			const text = await elems[0].getText()
			return text
		}
		return ''
	}

	goNextCity = async (region, regionIndex) => {
		await region.click()
		await this.sleep(3000)
		await this.waitElementLocated(selectors.cities, 'cities', async () => {
			await this.openRegions()
			await this.waitElementLocated(selectors.regions, 'regions', async () => await this.openRegions())
			const region = await this.unsafeFind(selectors.regions, regionIndex)
			await region.click()
		})
	}

	unsafeFind = async (selector, index = 0) => {
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

	waitElementLocated = async (selector, place, action) => {
		while (true) {
			try {
				const isElementLocated = await this.wait(until.elementLocated(By.css(selector)), 50000)
				if (isElementLocated) break
			} catch (e) {
				await this.navigate().refresh()
				console.log(`refreshed in ${place}`)
				await this.sleep(5000)
				if (action) {
					await action()
				} else {
					continue
				}
			}
		}
	}

	clickCurrentCity = async () => {
		await this.waitElementLocated(selectors.currentCity, 'currentCity', async () => await this.navigate().refresh())
		const currentCity = await this.unsafeFind(selectors.currentCity)
		await currentCity.click()
		await this.sleep(2000)
	}

	openRegions = async () => {
		await this.clickCurrentCity()
		await this.waitElementLocated(selectors.regionsButton, 'regionsButton', async () => await this.clickCurrentCity())
		const regionsButton = await this.unsafeFind(selectors.regionsButton)
		await regionsButton.click()
		await this.sleep(2000)
	}
}
