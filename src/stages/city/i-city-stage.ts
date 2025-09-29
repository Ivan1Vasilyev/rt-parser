import DriverExtention from '../../extentions/driver/driver-extention'

export interface ICityStage {
	go(driver: DriverExtention, citiesLength: number, regionName: string, i: number, regionNumber: number | undefined, cityNumber: number | undefined): Promise<void>
}
