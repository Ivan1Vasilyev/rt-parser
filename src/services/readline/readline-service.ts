import readline from 'readline'
import { IRootStage, isRootStageName, rootStageNamesEnum } from '../../stages/root/i-root-stage'
import { rootStagesDictionary, promptType, isCommandsEnum, commandsEnum } from './readline-models'
import { IReadlineService } from './i-readline-service'

class ReadLineService implements IReadlineService {
	private _stages: rootStagesDictionary = {} as rootStagesDictionary
	private _rl: readline.Interface
	private static _rlOptions = {
		input: process.stdin,
		output: process.stdout,
		prompt: 'Парсер слушает: ',
	}

	private _startCommandInfo: string
	private _stopCommandInfo: string

	constructor() {
		this._rl = readline.createInterface(ReadLineService._rlOptions)
		const rootStageNames = Object.values(rootStageNamesEnum).join('|')

		this._startCommandInfo = `[${commandsEnum.restart}|${commandsEnum.start}] [${rootStageNames}] [номер региона] [номер города]`
		this._stopCommandInfo = `[${commandsEnum.stop}] [${rootStageNames}]`
	}

	init = (...rootStages: IRootStage[]): void => {
		this._stages = [...rootStages].reduce((p, i) => ({ ...p, [i.name]: i }), {} as rootStagesDictionary)
		this._rl.prompt()
		this._rl.on('line', this._lineListener)
	}

	_validateInput = (input: string): promptType | undefined => {
		const {
			0: command,
			1: key,
			2: regionNumberValue,
			3: cityNumberValue,
		} = input
			.trim()
			.toLowerCase()
			.split(' ')
			.filter(i => i !== undefined)

		const regionNumber = Number.isInteger(+regionNumberValue) && +regionNumberValue > -1 ? +regionNumberValue : undefined
		const cityNumber = Number.isInteger(+cityNumberValue) && +cityNumberValue > -1 ? +cityNumberValue : undefined

		if (isCommandsEnum(command) && isRootStageName(key)) {
			return { command, key, regionNumber, cityNumber }
		}
	}

	_lineListener = (input: string): void => {
		const command = this._validateInput(input)
		const isRegionOrCityNotProvided = command?.regionNumber === undefined || command.cityNumber === undefined

		switch (command?.command) {
			case commandsEnum.restart:
				if (isRegionOrCityNotProvided) {
					this._logStartInfo()
					break
				}

				this._stages[command.key].restart({ regionNumber: command.regionNumber, cityNumber: command.cityNumber })
				break

			case commandsEnum.stop:
				this._stages[command.key].stop()
				break

			case commandsEnum.start:
				if (isRegionOrCityNotProvided) {
					this._logStartInfo()
					break
				}

				this._stages[command.key].start({ regionNumber: command.regionNumber, cityNumber: command.cityNumber })
				break

			default:
				this._logCommandInfo()
		}

		this._rl.prompt()
	}

	_logStartInfo = () => {
		console.log(`Для команд ${commandsEnum.restart} или ${commandsEnum.start} укажите номера региона и города через пробел`)
		console.log(this._startCommandInfo)
	}

	_logCommandInfo = (): void => {
		console.log('Формат команды:')
		console.log(this._startCommandInfo)
		console.log(this._stopCommandInfo)
	}
}

export default new ReadLineService() as IReadlineService
