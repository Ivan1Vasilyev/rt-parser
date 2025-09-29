import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'
import { IXlsxExtention, tariffType, keys } from './i-xlsx-extention'
import { SHEET_NAME } from '../../utils/template-config'

export default class XlsxExtention implements IXlsxExtention {
	workbook: XLSX.WorkBook
	worksheet: tariffType[]
	fileName: string
	dataDir: string
	sheetName: string = 'Тарифы'

	constructor(fileName: string) {
		this.workbook = XLSX.utils.book_new()

		XLSX.utils.book_append_sheet(this.workbook, [], SHEET_NAME)
		this.workbook.Sheets[SHEET_NAME] = {}

		this.worksheet = XLSX.utils.sheet_to_json<tariffType>(this.workbook.Sheets[SHEET_NAME])

		// const __dirname = path.dirname(fileURLToPath(import.meta.url))
		this.dataDir = path.join(__dirname, '../../../data')

		if (!fs.existsSync(this.dataDir)) {
			fs.mkdirSync(this.dataDir)
		}

		this.fileName = this.setFileName(fileName)
	}

	writeFile(): void {
		XLSX.utils.sheet_add_json(this.workbook.Sheets[SHEET_NAME], this.worksheet)
		XLSX.writeFileXLSX(this.workbook, path.join(this.dataDir, this.fileName))
	}

	getTemplate = (): tariffType => keys.reduce((obj, value) => ({ ...obj, [value]: '' }), {} as tariffType)

	private setFileName(fileName: string): string {
		let count = 1
		const date = new Date().toLocaleDateString()
		while (fs.existsSync(path.join(this.dataDir, `${fileName} ${date}.xlsx`))) {
			fileName = `${fileName} ${count++}`
		}

		return `${fileName} ${date}.xlsx`
	}

	push(template: tariffType): void {
		this.worksheet.push(template)
	}

	KEYS = {
		cityName: 'Город',
		tariffName: 'Название тарифа',
		priceWithDiscount: 'Цена со скидкой',
		price: 'Цена',
		discountDuration: 'Длительность скидки в мес',
		priceInfo: 'Доп. информация по цене',
		tariffInfo: 'Доп. информация по тарифу',
		discountMark: 'Признак акции',
		speed: 'Скорость мбит/сек',
		routerIncluded: 'WiFi-роутер в комплекте',
		routerForRent: 'WiFi-роутер в аренду',
		routerToBuy: 'WiFi-роутер покупка',
		routerInInstallment: 'WiFi-роутер в рассрочку',
		TV: 'ТВ Каналов',
		HD: 'HD каналов',
		UHD: 'UHD каналов',
		interactiveTV: 'Интерактивное ТВ каналов',
		TVBoxIncluded: 'ТВ-приставка в комплекте',
		TVBoxForRent: 'ТВ-приставка в аренду',
		TVBoxToBuy: 'ТВ-приставка покупка',
		TVBoxInInstallment: 'ТВ-приставка в рассрочку',
		minutes: 'Мин',
		SMS: 'Смс',
		GB: 'Гб',
		comment: 'Комментарий к моб. связи',
		priority: 'Приоритет',
		region: 'Регион',
		cluster: 'Кластер',
	} as const
}
