import readline from 'readline'
import RootStage from '../../stages/root/root-stage'
import { rootStageNamesEnum } from '../../stages/models/i-root-stage'
import { commandsEnum, isCommandsEnum, isRootStageName, promptType, stagesDictionary } from '../models/readline'

export default class ReadLineService {
	private _stages: stagesDictionary
	private _rl: readline.Interface
	private _rlOptions = {
		input: process.stdin,
		output: process.stdout,
		prompt: 'Парсер слушает: ',
	}

	constructor(...rootStages: RootStage[]) {
		this._stages = [...rootStages].reduce((p, i) => ({ ...p, [i.name]: i }), {} as stagesDictionary)
		this._rl = readline.createInterface(this._rlOptions)
	}

	_validateInput = (input: string): promptType | undefined => {
		const { 0: command, 1: key, 2: regionNumberValue, 3: cityNumberValue } = input.trim().toLowerCase().split(' ')
		const regionNumber = Number.isInteger(+regionNumberValue) && +regionNumberValue > -1 ? +regionNumberValue : undefined
		const cityNumber = Number.isInteger(+cityNumberValue) && +cityNumberValue > -1 ? +cityNumberValue : undefined

		if (isCommandsEnum(command) && isRootStageName(key)) return { command, key, regionNumber, cityNumber }
	}

	init = (): void => {
		this._rl.prompt()
		this._rl.on('line', this._lineListener)
	}

	_lineListener = (input: string): void => {
		const command = this._validateInput(input)

		switch (command?.command) {
			case commandsEnum.restart:
				this._stages[command.key].cancelationToken.isInterrupted = true
				this._stages[command.key].restart(command.regionNumber, command.cityNumber)

				break
			case commandsEnum.stop:
				this._stages[command.key].cancelationToken.isInterrupted = true
				break
			case commandsEnum.start:
				this._stages[command.key].cancelationToken.isInterrupted = false
				this._stages[command.key].restart(command.regionNumber, command.cityNumber)

				break
			default:
				this._logCommandInfo()
		}

		this._rl.prompt()
	}

	_logCommandInfo = (): void => {
		console.log('Формат команды:')
		console.log(
			`[${Object.values(commandsEnum).join('|')}] [${Object.values(rootStageNamesEnum)
				.filter(i => i !== rootStageNamesEnum.cities)
				.join('|')}] [номер региона (необязательно)] [номер города (необязательно)]`
		)
	}
}
