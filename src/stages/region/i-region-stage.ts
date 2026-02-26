import { clusterNamesEnum } from '../../services/cluster/cluster-models'
import { ICityStage } from '../city/i-city-stage'
import { ILoggerService } from '../../services/logger/i-logger-service'
import { IDriverService } from '../../services/driver/i-driver-service'
import { cancelationTokenType, startParamsType } from '../root/root-stage-models'

export interface IRegionStage {
	go(driver: IDriverService, cancelationToken: cancelationTokenType, startParams: startParamsType): Promise<void>
}

export interface IRegionStageCtor {
	new (cityStage: ICityStage, logger: ILoggerService, clustes: clusterNamesEnum[]): IRegionStage
}
