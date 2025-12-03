import { rootStageNamesEnum, IRootStage } from '../../stages/root/i-root-stage'

export type rootStagesDictionary = Record<rootStageNamesEnum, IRootStage>

export type promptType = {
	key: rootStageNamesEnum
	command: commandsEnum
	regionNumber?: number
	cityNumber?: number
}

export enum commandsEnum {
	start = 'start',
	restart = 'restart',
	stop = 'stop',
}

export const isCommandsEnum = (value: string): value is commandsEnum => value in commandsEnum
