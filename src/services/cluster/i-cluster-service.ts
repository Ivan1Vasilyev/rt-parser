import { clusterNamesEnum } from './cluster-models'

export interface IClusterService {
	getRegions(clusterNames: clusterNamesEnum[]): string[]
	getClusterName(regionName: string): clusterNamesEnum
}
