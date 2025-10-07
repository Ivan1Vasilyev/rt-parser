export interface IRootStage {
	go(regionNumber?: number | undefined, cityNumber?: number | undefined): Promise<void>
}
