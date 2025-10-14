export enum clusterNamesEnum {
	east = 'Восток',
	north = 'Север',
	south = 'Юг',
	westCenterMoscow = 'Запад, Центр, Москва',
	unknown = 'вне известных кластеров',
}

export type clusterConfigType = {
	clusterNames: clusterNamesEnum[]
	isExcept: boolean
}

export type clustersType = Record<clusterNamesEnum, string[]>
