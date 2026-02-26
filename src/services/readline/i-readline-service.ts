import { IRootStage } from '../../stages/root/i-root-stage'

export interface IReadlineService {
	init(...rootStages: IRootStage[]): void
}
