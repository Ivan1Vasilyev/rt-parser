import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'
import { IXlsxExtention, tariffDataType, tariffDataKeysEnum, citiesDataType } from '../models/i-xlsx-extention'

class XlsxExtention<T> implements IXlsxExtention {
	_TARIFFS_SHEET_NAME: string = 'Тарифы'
	_CITIES_SHEET_NAME: string = 'Индексы'
	_workbook: XLSX.WorkBook
	_tariffsWorksheet: tariffDataType[]
	_citiesWorksheet: citiesDataType[]
	_path: string

	constructor(fileName: string) {
		this._workbook = XLSX.utils.book_new()

		XLSX.utils.book_append_sheet(this._workbook, [], this._TARIFFS_SHEET_NAME)
		XLSX.utils.book_append_sheet(this._workbook, [], this._CITIES_SHEET_NAME)
		this._workbook.Sheets[this._TARIFFS_SHEET_NAME] = {}
		this._workbook.Sheets[this._CITIES_SHEET_NAME] = {}
		this._tariffsWorksheet = XLSX.utils.sheet_to_json<tariffDataType>(this._workbook.Sheets[this._TARIFFS_SHEET_NAME])
		this._citiesWorksheet = XLSX.utils.sheet_to_json<citiesDataType>(this._workbook.Sheets[this._CITIES_SHEET_NAME])
		const dataDir = path.join(__dirname, '../../../data')

		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true })
		}

		fileName = this.setFileName(fileName, dataDir)
		this._path = path.join(dataDir, fileName)
	}

	writeTariffsFile = (tariffData: tariffDataType[]): void => {
		this._tariffsWorksheet.push(...tariffData)
		XLSX.utils.sheet_add_json(this._workbook.Sheets[this._TARIFFS_SHEET_NAME], this._tariffsWorksheet)
		XLSX.writeFileXLSX(this._workbook, this._path)
	}

	writeCitiesFile = (citiesData: citiesDataType[]): void => {
		this._citiesWorksheet.push(...citiesData)
		XLSX.utils.sheet_add_json(this._workbook.Sheets[this._CITIES_SHEET_NAME], this._citiesWorksheet)
		XLSX.writeFileXLSX(this._workbook, this._path)
	}

	getTemplate = (): tariffDataType => Object.values(tariffDataKeysEnum).reduce((obj, value) => ({ ...obj, [value]: '' }), {} as tariffDataType)
	getCitiesTemplte = (): citiesDataType => ({
		[tariffDataKeysEnum.region]: '',
		[tariffDataKeysEnum.cityName]: '',
		[tariffDataKeysEnum.cluster]: '',
	})

	private setFileName = (fileName: string, dataDir: string): string => {
		const date = new Date().toLocaleDateString()
		const name = fileName
		let count = 1
		while (fs.existsSync(path.join(dataDir, `${fileName} ${date}.xlsx`))) {
			fileName = `${count++} ${name}`
		}

		return `${fileName} ${date}.xlsx`
	}
}

const xslxService = new XlsxExtention<tariffDataType>('РТ тарифы')
export default xslxService
