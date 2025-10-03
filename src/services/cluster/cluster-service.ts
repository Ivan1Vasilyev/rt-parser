import { WEST_CLUSTER_NAME, NORTH_CLUSTER_NAME, EAST_CLUSTER_NAME, NORTH_WEST_CENTER_MOSCOW_CLUSTER_NAME } from './cluster-names'

const clusterNames = [WEST_CLUSTER_NAME, NORTH_CLUSTER_NAME, EAST_CLUSTER_NAME, NORTH_WEST_CENTER_MOSCOW_CLUSTER_NAME] as const

export type ClusterNamesType = (typeof clusterNames)[number]
type clustersType = Record<ClusterNamesType, string[]>

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
		Восток: this._eastRegions,
		Запад: this._westRegions,
		Юг: this._southRegions,
		'Северо-Запад, Центр, Москва': this.northWestCenterMoscowRegions,
	}

	getRegionsByCluster(clusterName: ClusterNamesType): string[] {
		return this._clusters[clusterName]
	}

	_UNKNUWN_CLUSTER = 'вне известных кластеров'

	getCluster(regionName: string): ClusterNamesType | typeof this._UNKNUWN_CLUSTER {
		for (let i = 0; i < clusterNames.length; i++) {
			if (this._clusters[clusterNames[i]].some((r: string) => regionName.includes(r))) {
				return clusterNames[i]
			}
		}

		return this._UNKNUWN_CLUSTER
	}
}

const clustersService = new ClusterService()
export default clustersService
