export enum clusterNamesEnum {
	east = 'Восток',
	west = 'Запад',
	north = 'Юг',
	northWestCenterMoscow = 'Северо-Запад, Центр, Москва',
	unknown = 'вне известных кластеров',
}

export type clustersType = Record<clusterNamesEnum, string[]>
