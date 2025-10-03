import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'
import { IXlsxExtention, tariffDataType, keys } from './i-xlsx-extention'

export default class XlsxExtention implements IXlsxExtention {
	_SHEET_NAME: string = 'Тарифы'
	_workbook: XLSX.WorkBook
	_fileName: string
	_dataDir: string
	_worksheet: tariffDataType[]

	constructor(fileName: string) {
		this._workbook = XLSX.utils.book_new()

		XLSX.utils.book_append_sheet(this._workbook, [], this._SHEET_NAME)
		this._workbook.Sheets[this._SHEET_NAME] = {}
		this._worksheet = XLSX.utils.sheet_to_json<tariffDataType>(this._workbook.Sheets[this._SHEET_NAME])
		this._dataDir = path.join(__dirname, '../../../data')

		if (!fs.existsSync(this._dataDir)) {
			fs.mkdirSync(this._dataDir, { recursive: true })
		}

		this._fileName = this.setFileName(fileName)
	}

	writeFile(): void {
		XLSX.utils.sheet_add_json(this._workbook.Sheets[this._SHEET_NAME], this._worksheet)
		XLSX.writeFileXLSX(this._workbook, path.join(this._dataDir, this._fileName))
	}

	getTemplate = (): tariffDataType => keys.reduce((obj, value) => ({ ...obj, [value]: '' }), {} as tariffDataType)

	push = (tariffData: tariffDataType): void => {
		this._worksheet.push(tariffData)
	}

	private setFileName = (fileName: string): string => {
		const date = new Date().toLocaleDateString()
		const name = fileName
		let count = 1
		while (fs.existsSync(path.join(this._dataDir, `${fileName} ${date}.xlsx`))) {
			fileName = `${count++} ${name}`
		}

		return `${fileName} ${date}.xlsx`
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
