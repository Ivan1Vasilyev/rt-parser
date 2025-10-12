export enum clusterNamesEnum {
	east = 'Восток',
	west = 'Запад',
	north = 'Юг',
	northCenterMoscow = 'Север, Центр, Москва',
	unknown = 'вне известных кластеров',
}

export type clusterConfigType = {
	clusterNames: clusterNamesEnum[]
	isExcept: boolean
}

export type clustersType = Record<clusterNamesEnum, string[]>
