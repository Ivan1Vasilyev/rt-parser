import fs from 'fs'
import path from 'path'

export default class Logger {
	private _logFileName: string
	private _logsDir: string
	private _logFilePath: any
	private _logs: string = ''
	private _states: logState = {
		[logStateEnum.error]: 'ERROR! ',
		[logStateEnum.warning]: 'WARNING! ',
		[logStateEnum.default]: '',
	}

	constructor(logFileName: string = 'app') {
		this._logFileName = `${logFileName}.log`
		this._logsDir = './logs'
		this._logFilePath = path.join(this._logsDir, this._logFileName)

		if (!fs.existsSync(this._logsDir)) {
			fs.mkdirSync(this._logsDir, { recursive: true })
		}

		this.clearLog()
	}

	clearLog() {
		try {
			this._logs = ''
			fs.writeFileSync(this._logFilePath, '')
			console.log(`Лог-файл ${this._logFileName} очищен`)
		} catch (err) {
			console.error('Ошибка очистки лог-файла:', err)
		}
	}

	log(message: string, state: logStateEnum = logStateEnum.default) {
		const timestamp = new Date().toLocaleTimeString()
		// const logMessage = `[${timestamp}] ${message}\n`

		const logMessage = `[${timestamp}] ${this._states[state]}${message}\n`

		// пишем файл вверх, потому что IDE не хочет сама скролить файл вниз
		this._logs = logMessage + this._logs

		fs.writeFileSync(this._logFilePath, this._logs)
	}
}

export enum logStateEnum {
	error,
	warning,
	default,
}

type logState = {
	[logStateEnum.error]: string
	[logStateEnum.warning]: string
	[logStateEnum.default]: string
}
