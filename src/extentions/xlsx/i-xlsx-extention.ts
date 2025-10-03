export const keys = [
	'Город',
	'Название тарифа',
	'Цена со скидкой',
	'Цена',
	'Длительность скидки в мес',
	'Доп. информация по цене',
	'Доп. информация по тарифу',
	'Признак акции',
	'Скорость мбит/сек',
	'WiFi-роутер в комплекте',
	'WiFi-роутер в аренду',
	'WiFi-роутер покупка',
	'WiFi-роутер в рассрочку',
	'ТВ Каналов',
	'HD каналов',
	'UHD каналов',
	'Интерактивное ТВ каналов',
	'ТВ-приставка в комплекте',
	'ТВ-приставка в аренду',
	'ТВ-приставка покупка',
	'ТВ-приставка в рассрочку',
	'Мин',
	'Смс',
	'Гб',
	'Комментарий к моб. связи',
	'Приоритет',
	'Регион',
	'Кластер',
] as const

export type keysType = { [key: string]: (typeof keys)[number] }
export type tariffDataType = Record<(typeof keys)[number], string | undefined>

export interface IXlsxExtention {
	writeFile(): void
	getTemplate(): tariffDataType
	push(template: tariffDataType): void
	KEYS: keysType
}
