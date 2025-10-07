import fs from 'fs'
import path from 'path'
import XLSX from 'xlsx'
import { IXlsxExtention, tariffDataType, tariffDataKeysEnum } from '../models/i-xlsx-extention'

class XlsxExtention implements IXlsxExtention {
	_SHEET_NAME: string = 'Тарифы'
	_workbook: XLSX.WorkBook
	_worksheet: tariffDataType[]
	_path: string

	constructor(fileName: string) {
		this._workbook = XLSX.utils.book_new()

		XLSX.utils.book_append_sheet(this._workbook, [], this._SHEET_NAME)
		this._workbook.Sheets[this._SHEET_NAME] = {}
		this._worksheet = XLSX.utils.sheet_to_json<tariffDataType>(this._workbook.Sheets[this._SHEET_NAME])
		const dataDir = path.join(__dirname, '../../../data')

		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true })
		}

		fileName = this.setFileName(fileName, dataDir)
		this._path = path.join(dataDir, fileName)
	}

	writeFile = (): void => {
		XLSX.utils.sheet_add_json(this._workbook.Sheets[this._SHEET_NAME], this._worksheet)
		XLSX.writeFileXLSX(this._workbook, this._path)
	}

	getTemplate = (): tariffDataType => Object.values(tariffDataKeysEnum).reduce((obj, value) => ({ ...obj, [value]: '' }), {} as tariffDataType)

	push = (tariffData: tariffDataType): void => {
		this._worksheet.push(tariffData)
	}

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

const xslxService = new XlsxExtention('РТ тарифы')
export default xslxService
