import Logger from '../../services/logger/log-service'
import { ICardStage } from '../card/i-card-stage'
import CityStage from './city-stage'

export default class CityStageInternet extends CityStage {
	protected override _tariffsSelector: string = '.landing-form-wrap .landing-offer__name'
	protected override _containerSelector: string = '.landing-form-wrap'

	constructor(CardStageClass: ICardStage, logger: Logger) {
		super(CardStageClass, logger)
	}
}
