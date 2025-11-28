import { IRootStage, rootStageNamesEnum } from '../../stages/models/i-root-stage'

export type stagesDictionary = Record<rootStageNamesEnum, IRootStage>

export type promptType = {
	key: rootStageNamesEnum
	command: commandsEnum
	regionNumber: number | undefined
	cityNumber: number | undefined
}

export enum commandsEnum {
	restart = 'restart',
	stop = 'stop',
	start = 'start',
}

export const isCommandsEnum = (value: string): value is commandsEnum => value in commandsEnum

export const isRootStageName = (value: string): value is rootStageNamesEnum => value in rootStageNamesEnum
