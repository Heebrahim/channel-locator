import * as S from "@effect/schema/Schema";

export const Store = S.struct({
	id: S.number,
	tel: S.number,
	lga: S.string,
	name: S.string,
	type: S.string,
	color: S.string,
	state: S.string,
	region: S.string,
	address: S.string,
	latitude: S.number,
	longitude: S.number,
});

export type Store = S.To<typeof Store>;
