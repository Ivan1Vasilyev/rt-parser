import fs from 'fs'
import path from 'path'

export default class Logger {
	logFileName: string
	logsDir: string
	logFilePath: any

	constructor(logFileName: string = 'app') {
		this.logFileName = `${logFileName}.log`
		this.logsDir = './logs'
		this.logFilePath = path.join(this.logsDir, this.logFileName)

		if (!fs.existsSync(this.logsDir)) {
			fs.mkdirSync(this.logsDir, { recursive: true })
		}

		this.clearLog()
	}

	clearLog() {
		try {
			fs.writeFileSync(this.logFilePath, '')
			console.log(`Лог-файл ${this.logFileName} очищен`)
		} catch (err) {
			console.error('Ошибка очистки лог-файла:', err)
		}
	}

	log(message: string) {
		const timestamp = new Date().toLocaleTimeString()
		const logMessage = `[${timestamp}] ${message}\n`

		fs.appendFile(this.logFilePath, logMessage, err => {
			if (err) {
				console.error('Ошибка записи в лог:', err)
			}
		})
	}
}
