import * as S from "@effect/schema/Schema";

export const DataLayer = S.struct({
	id: S.number,
	title: S.string,
	mapName: S.string,
	priority: S.number,
	tableName: S.string,
	description: S.string,
	legend: S.array(S.struct({ value: S.string, color: S.string })),
	attributes: S.array(
		S.struct({
			value: S.string,
			alias: S.string,
			formula: S.string,
			type: S.union(S.literal("STRING")),
			category: S.union(
				S.literal("DESCRIPTION"),
				S.literal("STATISTICS"),
			),
		}),
	),
});

export type DataLayer = S.To<typeof DataLayer>;
