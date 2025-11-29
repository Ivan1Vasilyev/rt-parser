import fs from 'fs'
import path from 'path'
import { ILoggerService, logStateEnum, statesType } from './i-logger-service'

// типа scope, но не scope
export default class LoggerService implements ILoggerService {
	private _LOGS_DIRECTORY: string = './logs'
	private _logFileName: string
	private _logFilePath: any
	private _logs: string = ''
	private _states: statesType = {
		[logStateEnum.error]: 'ERROR! ',
		[logStateEnum.warning]: 'WARNING! ',
		[logStateEnum.default]: '',
	}

	constructor(logFileName: string = 'no_name') {
		this._logFileName = `${logFileName}.log`
		this._logFilePath = path.join(this._LOGS_DIRECTORY, this._logFileName)

		if (!fs.existsSync(this._LOGS_DIRECTORY)) {
			fs.mkdirSync(this._LOGS_DIRECTORY, { recursive: true })
		}
	}

	log(message: string, state: logStateEnum = logStateEnum.default) {
		const timestamp = new Date().toLocaleTimeString()
		const logMessage = `[${timestamp}] ${this._states[state]}${message}\n`

		// пишем файл вверх, потому что IDE не хочет сама скролить файл вниз
		this._logs = logMessage + this._logs

		fs.writeFileSync(this._logFilePath, this._logs)
	}
}
