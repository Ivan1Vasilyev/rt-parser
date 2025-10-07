export enum clusterNamesEnum {
	east = 'Восток',
	west = 'Запад',
	north = 'Юг',
	northWestCenterMoscow = 'Северо-Запад, Центр, Москва',
}

export type clustersType = Record<clusterNamesEnum, string[]>
