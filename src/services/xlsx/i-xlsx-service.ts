import { citiesDataType, tariffDataType } from './xlsx-models'

export interface IXlsxService {
	writeTariffsFile(tariffData: tariffDataType[]): void
	writeCitiesFile(citiesData: citiesDataType[]): void
	getTemplate(): tariffDataType
	getCitiesTemplte(): citiesDataType
}
