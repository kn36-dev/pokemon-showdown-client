import { type Species, type StatName } from './battle-dex-data';
import { type Dex, type ModdedDex } from './battle-dex';

/**
 * Interface representing the secondary Pokemon in a fusion
 */
export interface FusionSet {
	baseSpecies: string;
	weightkg: number;
	types: string[];
}

/**
 * Extended PokemonSet to handle Fusion data
 */
export interface PokemonSet {
	species: string;
	weightkg: number;
	fusionSet?: FusionSet;
}

/**
 * Interface for the naming dictionary used in nickname generation
 */
interface NameData {
	prefix: string;
	suffix: string;
}

// Global declaration for the naming dictionary (usually defined in a data file)
declare const POKEMON_NAME_PREFIX_SUFFIX: Record<string, NameData>;

export class BattleFusion {
	/**
	 * Calculates a single base stat for a fused Pokemon.
	 * Head provides 2/3 of HP, SpA, and SpD.
	 * Body provides 2/3 of Atk, Def, and Spe.
	 */
	static getBaseStat(stat: StatName, set: PokemonSet, dex: ModdedDex): number {
		const headPokemonSpecies = dex.species.get(set.species);

		if (set.fusionSet) {
			const bodyPokemonSpecies = dex.species.get(set.fusionSet.baseSpecies);
			const headStat = headPokemonSpecies.baseStats[stat];
			const bodyStat = bodyPokemonSpecies.baseStats[stat];

			if (stat === "hp" || stat === "spa" || stat === "spd") {
				const headWeight = (2 * Number(headStat)) / 3;
				const bodyWeight = (1 * Number(bodyStat)) / 3;
				return Math.floor(headWeight + bodyWeight);
			} else if (stat === "atk" || stat === "def" || stat === "spe") {
				const headWeight = (1 * Number(headStat)) / 3;
				const bodyWeight = (2 * Number(bodyStat)) / 3;
				return Math.floor(headWeight + bodyWeight);
			}
		}

		return headPokemonSpecies.baseStats[stat];
	}

	/**
	 * Returns the full base stats table for a fused Pokemon.
	 */
	static getBaseStats(set: PokemonSet, dex: ModdedDex): Dex.StatsTable {
		const headPokemonSpecies = dex.species.get(set.species);

		if (set.fusionSet) {
			const bodyPokemonSpecies = dex.species.get(set.fusionSet.baseSpecies);
			const headStats = headPokemonSpecies.baseStats;
			const bodyStats = bodyPokemonSpecies.baseStats;

			return this._internalGetBaseStats(headStats, bodyStats);
		}

		return headPokemonSpecies.baseStats;
	}

	/**
	 * Generates a fused nickname based on prefixes and suffixes.
	 * Logic handles overlapping characters and spacing.
	 */
	static getFusionNickname(set: PokemonSet): string {
		if (
			!set.fusionSet ||
			!POKEMON_NAME_PREFIX_SUFFIX[set.species] ||
			!POKEMON_NAME_PREFIX_SUFFIX[set.fusionSet.baseSpecies]
		) {
			return set.species;
		}

		let headPokemonPrefix = POKEMON_NAME_PREFIX_SUFFIX[set.species].prefix;
		let bodyPokemonSuffix = POKEMON_NAME_PREFIX_SUFFIX[set.fusionSet.baseSpecies].suffix;

		const prefixLastChar = headPokemonPrefix.slice(-1);
		const suffixFirstChar = bodyPokemonSuffix.charAt(0);

		// Remove duplicate letter at joining point
		if (prefixLastChar.toLowerCase() === suffixFirstChar.toLowerCase()) {
			headPokemonPrefix = headPokemonPrefix.slice(0, -1);
		}

		// Capitalize suffix if separated by space or hyphen
		if (prefixLastChar === " " || prefixLastChar === "-") {
			bodyPokemonSuffix = suffixFirstChar.toUpperCase() + bodyPokemonSuffix.slice(1);
		}

		return headPokemonPrefix + bodyPokemonSuffix;
	}

	/**
	 * Averages the weight of both Pokemon.
	 */
	static getFusionWeight(set: PokemonSet): number {
		if (!set.fusionSet) return set.weightkg;
		return (set.weightkg + set.fusionSet.weightkg) / 2;
	}

	/**
	 * Determines the resulting types of a fusion.
	 * Uses head's primary (with Normal/Flying bird override) and body's secondary/primary.
	 */
	static getFusionTypes(species: Species, fusionSet?: FusionSet): string[] {
		const headPokemonTypes = species.types;
		const mutableHeadPokemonTypes: string[] = [...headPokemonTypes];
		if (!fusionSet) return mutableHeadPokemonTypes;

		const bodyPokemonTypes = fusionSet.types;
		const headPokemonPrimaryType = headPokemonTypes[0];
		const headPokemonSecondaryType = headPokemonTypes[1];

		/** * RULE: Normal/Flying Override
		 * Standard fusions use the head's primary type. However, for Normal/Flying types
		 * (common birds), we prioritize 'Flying' to make the fusion more unique.
		 */
		const isNormalFlyingPokemon = headPokemonPrimaryType === 'Normal' && headPokemonSecondaryType === 'Flying';
		const effectiveHeadType = isNormalFlyingPokemon ? headPokemonSecondaryType : headPokemonPrimaryType;

		const bodyPokemonPrimaryType = bodyPokemonTypes[0];
		const bodyPokemonSecondaryType = bodyPokemonTypes[1];

		if (bodyPokemonSecondaryType) {
			// If body secondary type is different from head primary, use head primary + body secondary
			if (bodyPokemonSecondaryType !== effectiveHeadType) {
				return [effectiveHeadType, bodyPokemonSecondaryType];
			}
			// If same, fallback to head primary + body primary
			return [effectiveHeadType, bodyPokemonPrimaryType];
		}

		// If body only has 1 type and it's different
		if (bodyPokemonPrimaryType !== effectiveHeadType) {
			return [effectiveHeadType, bodyPokemonPrimaryType];
		}

		// Final fallback for mono-type results
		return [headPokemonPrimaryType];
	}

	/**
	 * Internal helper to calculate the stats object.
	 */
	private static _internalGetBaseStats(headStats: Dex.StatsTable, bodyStats: Dex.StatsTable): Dex.StatsTable {
		return {
			hp: Math.floor((2 * Number(headStats.hp) / 3) + (1 * Number(bodyStats.hp) / 3)),
			atk: Math.floor((1 * Number(headStats.atk) / 3) + (2 * Number(bodyStats.atk) / 3)),
			def: Math.floor((1 * Number(headStats.def) / 3) + (2 * Number(bodyStats.def) / 3)),
			spa: Math.floor((2 * Number(headStats.spa) / 3) + (1 * Number(bodyStats.spa) / 3)),
			spd: Math.floor((2 * Number(headStats.spd) / 3) + (1 * Number(bodyStats.spd) / 3)),
			spe: Math.floor((1 * Number(headStats.spe) / 3) + (2 * Number(bodyStats.spe) / 3)),
		};
	}
}
