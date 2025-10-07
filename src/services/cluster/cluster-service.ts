import { clustersType, clusterNamesEnum } from '../models/cluster'

class ClusterService {
	_eastRegions = [
		'Амурская',
		'Еврейская',
		'Камчатский',
		'Магаданская',
		'Приморский',
		'Сахалинская',
		'Хабаровский',
		'Алтайский',
		'Забайкальский',
		'Новосибирская',
		'Алтай',
		'Бурятия',
		'Саха',
		'Иркутская',
		'Кемеровская',
		'Красноярский',
		'Омская',
		'Тыва',
		'Хакасия',
		'Томская',
		'Курганская',
		'Пермский',
		'Свердловская',
		'Тюменская',
		'Ханты-Мансийский',
		'Челябинская',
		'Ямало-Ненецкий',
		'Чукотский',
	]

	_southRegions = [
		'Нижегородская',
		'Марий Эл',
		'Кировская',
		'Нижегородская',
		'Пензенская',
		'Мордовия',
		'Удмуртская',
		'Оренбургская',
		'Саратовская',
		'Самарская',
		'Ульяновская',
		'Чувашская',
		'Татарстан',
		'Башкортостан',
		'Астраханская',
		'Волгоградская',
		'Ростовская',
		'Адыгея',
		'Дагестан',
		'Кабардино Балкарская',
		'Северная Осетия',
		'Карачаево Черкесская',
		'Ставропольский край',
		'Ингушетия',
		'Калмыкия',
		'Краснодарский край',
	]

	_westRegions = ['Архангельская', 'Вологодская', 'Калининградская', 'Карелия', 'Мурманская', 'Новгородская', 'Псковская', 'Коми', 'Санкт-Петербург', 'Ленинградская']

	northWestCenterMoscowRegions = [
		'Москва город',
		'Московская',
		'Белгородская',
		'Брянская',
		'Владимирская',
		'Воронежская',
		'Ивановская',
		'Калужская',
		'Костромская',
		'Курская',
		'Липецкая',
		'Орловская',
		'Рязанская',
		'Смоленская',
		'Тамбовская',
		'Тверская',
		'Тульская',
		'Ярославская',
		...this._westRegions,
	]

	_clusters: clustersType = {
		[clusterNamesEnum.east]: this._eastRegions,
		[clusterNamesEnum.west]: this._westRegions,
		[clusterNamesEnum.north]: this._southRegions,
		[clusterNamesEnum.northWestCenterMoscow]: this.northWestCenterMoscowRegions,
	}

	getRegionsByCluster = (clusterName: clusterNamesEnum): string[] => this._clusters[clusterName]

	_UNKNUWN_CLUSTER = 'вне известных кластеров'

	getCluster(regionName: string): clusterNamesEnum | typeof this._UNKNUWN_CLUSTER {
		for (const key of Object.values(clusterNamesEnum)) {
			if (this._clusters[key].some((r: string) => regionName.includes(r))) {
				return key
			}
		}

		return this._UNKNUWN_CLUSTER
	}
}

const clustersService = new ClusterService()
export default clustersService
