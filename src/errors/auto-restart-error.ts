import { startParamsType } from '../stages/root/root-stage-models'

export default class AutoRestartError extends Error {
	regionNumber: number | undefined
	cityNumber: number | undefined

	constructor(message: string, startParams: startParamsType) {
		super(message)
		this.regionNumber = startParams.regionNumber
		this.cityNumber = startParams.cityNumber
	}
}
