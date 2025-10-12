import { clustersType, clusterNamesEnum, clusterConfigType } from '../models/cluster'

class ClusterService {
	_eastRegions = [
		'Алтай',
		'Алтайский',
		'Амурская',
		'Бурятия',
		'Еврейская',
		'Забайкальский',
		'Иркутская',
		'Камчатский',
		'Кемеровская',
		'Красноярский',
		'Курганская',
		'Магаданская',
		'Новосибирская',
		'Омская',
		'Пермский',
		'Приморский',
		'Саха',
		'Сахалинская',
		'Свердловская',
		'Томская',
		'Тыва',
		'Тюменская',
		'Хабаровский',
		'Хакасия',
		'Ханты-Мансийский',
		'Челябинская',
		'Чукотский',
		'Ямало-Ненецкий',
	]

	_southRegions = [
		'Адыгея',
		'Астраханская',
		'Башкортостан',
		'Волгоградская',
		'Дагестан',
		'Ингушетия',
		'Кабардино Балкарская',
		'Калмыкия',
		'Карачаево Черкесская',
		'Кировская',
		'Краснодарский край',
		'Марий Эл',
		'Мордовия',
		'Нижегородская',
		'Оренбургская',
		'Пензенская',
		'Ростовская',
		'Самарская',
		'Саратовская',
		'Северная Осетия',
		'Ставропольский край',
		'Татарстан',
		'Удмуртская',
		'Ульяновская',
		'Чувашская',
	]

	_westRegions = ['Архангельская', 'Вологодская', 'Калининградская', 'Карелия', 'Коми', 'Ленинградская', 'Мурманская', 'Новгородская', 'Псковская', 'Санкт-Петербург']

	_northCenterMoscowRegions = [
		'Архангельская',
		'Белгородская',
		'Брянская',
		'Владимирская',
		'Вологодская',
		'Воронежская',
		'Ивановская',
		'Калужская',
		'Калининградская',
		'Карелия',
		'Коми',
		'Костромская',
		'Курская',
		'Ленинградская',
		'Липецкая',
		'Москва город',
		'Московская',
		'Мурманская',
		'Новгородская',
		'Орловская',
		'Псковская',
		'Рязанская',
		'Санкт-Петербург',
		'Смоленская',
		'Тамбовская',
		'Тверская',
		'Тульская',
		'Ярославская',
	]

	_clusters: clustersType = {
		[clusterNamesEnum.east]: this._eastRegions,
		[clusterNamesEnum.west]: this._westRegions,
		[clusterNamesEnum.north]: this._southRegions,
		[clusterNamesEnum.northCenterMoscow]: this._northCenterMoscowRegions,
		[clusterNamesEnum.unknown]: [],
	}

	getRegions = (clusterConfig: clusterConfigType): string[] => {
		if (clusterConfig.clusterNames.length === 0) return []

		const keys = clusterConfig.isExcept ? Object.values(clusterNamesEnum).filter(i => clusterConfig.clusterNames.includes(i)) : clusterConfig.clusterNames
		return keys.reduce((p, i) => p.concat(this._clusters[i]), [] as string[])
	}

	getCluster(regionName: string): clusterNamesEnum {
		for (const key of Object.values(clusterNamesEnum)) {
			if (this._clusters[key].some((r: string) => regionName.includes(r))) {
				return key
			}
		}

		return clusterNamesEnum.unknown
	}
}

const clustersService = new ClusterService()
export default clustersService
