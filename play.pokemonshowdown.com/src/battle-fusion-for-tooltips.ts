import type { Species } from "./battle-dex-data";

export const getSpeedStat = (headSpecies: Species, bodySpecies: Species) => {
	const headSpeedBaseStat = headSpecies.baseStats.spe;
	const bodySpeedBasState = bodySpecies.baseStats.spe;

	return _internal_calcSpeed(headSpeedBaseStat, bodySpeedBasState);
};

const _internal_calcSpeed = (headSpeed: number, bodySpeed: number) => {
	const headWeight = 1 * Number(headSpeed) / 3;
	const bodyWeight = 2 * Number(bodySpeed) / 3;
	return Math.floor((headWeight + bodyWeight));
};

export const getFusionTypes = (species: any, fusionSet: any) => {
	let headPokemonTypes = species.types;
	if (!fusionSet) return headPokemonTypes;

	let bodyPokemonTypes = fusionSet.types;

	let headPokemonPrimaryType = headPokemonTypes[0];
	let headPokemonSecondaryType = headPokemonTypes[1];

	/** * RULE: Normal/Flying Override
	 * Standard fusions use the head's primary type. However, for Normal/Flying types
	 * (common birds), we prioritize 'Flying' to make the fusion more unique.
	 */
	let isNormalFlyingPokemon = headPokemonPrimaryType === 'Normal' && headPokemonSecondaryType === 'Flying';
	let effectiveHeadType = isNormalFlyingPokemon ? headPokemonSecondaryType : headPokemonPrimaryType;

	let bodyPokemonPrimaryType = bodyPokemonTypes[0];
	let bodyPokemonSecondaryType = bodyPokemonTypes[1];

	// If the body has a secondary type
	if (bodyPokemonSecondaryType) {

		// Not the same with head primary type, use it directly.
		// Fire + Grass/Water = Fire/Water
		if (bodyPokemonSecondaryType !== effectiveHeadType) {
			return [effectiveHeadType, bodyPokemonSecondaryType];
		}

		// Same with head primary type, use body secondary type instead.
		// Fire + Dragon/Fire = Fire/Dragon
		if (bodyPokemonSecondaryType === effectiveHeadType) {
			return [effectiveHeadType, bodyPokemonPrimaryType];
		}
	}

	// If body only has 1 type and is not the same, use it directly.
	// Fire/Water + Grass = Fire/Grass
	if (bodyPokemonPrimaryType !== effectiveHeadType) {
		return [effectiveHeadType, bodyPokemonPrimaryType];
	}

	// If body only has 1 type and is the same with head primary type,
	// then we ONLY use head 1st type
	// So Bug/Flying + Bug = Bug
	return [headPokemonPrimaryType];
};
