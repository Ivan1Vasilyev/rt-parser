export enum clusterNamesEnum {
	east = 'Восток',
	north = 'Север',
	south = 'Юг',
	westCenterMoscow = 'Запад, Центр, Москва',
	unknown = 'вне известных кластеров',
}

export type clustersType = Record<clusterNamesEnum, string[]>
