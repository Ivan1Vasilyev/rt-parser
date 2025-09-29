import DriverExtention from '../../extentions/driver/driver-extention'

export interface IRegionStage {
	go(driver: DriverExtention, regionsLength: number, regionNumber: number | undefined, cityNumber: number | undefined): Promise<void>
}
