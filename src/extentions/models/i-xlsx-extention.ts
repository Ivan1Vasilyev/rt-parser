export enum tariffDataKeysEnum {
	cityName = 'Город',
	tariffName = 'Название тарифа',
	promoPrice = 'Цена со скидкой',
	price = 'Цена',
	discountDuration = 'Длительность скидки в мес',
	priceInfo = 'Доп. информация по цене',
	tariffInfo = 'Доп. информация по тарифу',
	discountMark = 'Признак акции',
	speed = 'Скорость мбит/сек',
	routerIncluded = 'WiFi-роутер в комплекте',
	routerForRent = 'WiFi-роутер в аренду',
	routerToBuy = 'WiFi-роутер покупка',
	routerInInstallment = 'WiFi-роутер в рассрочку',
	TV = 'ТВ Каналов',
	HD = 'HD каналов',
	UHD = 'UHD каналов',
	interactiveTV = 'Интерактивное ТВ каналов',
	TVBoxIncluded = 'ТВ-приставка в комплекте',
	TVBoxForRent = 'ТВ-приставка в аренду',
	TVBoxToBuy = 'ТВ-приставка покупка',
	TVBoxInInstallment = 'ТВ-приставка в рассрочку',
	minutes = 'Мин',
	SMS = 'Смс',
	GB = 'Гб',
	comment = 'Комментарий к моб. связи',
	priority = 'Приоритет',
	region = 'Регион',
	cluster = 'Кластер',
}

export type tariffDataType = Record<tariffDataKeysEnum, string | undefined>
export type citiesDataType = {
	[tariffDataKeysEnum.region]: string
	[tariffDataKeysEnum.cityName]: string
	[tariffDataKeysEnum.cluster]: string
}

export interface IXlsxExtention {
	writeTariffsFile(tariffData: tariffDataType[]): void
	writeCitiesFile(citiesData: citiesDataType[]): void
	getTemplate(): tariffDataType
}
