import * as S from "@effect/schema/Schema";

export const Branch = S.struct({
	id: S.number,
	tel: S.number,
	lga: S.string,
	branch_name: S.string,
	bank_name: S.string,
	type: S.string,
	color: S.string,
	state: S.string,
	region: S.string,
	address: S.string,
	latitude: S.number,
	longitude: S.number,
});

export type Branch = S.To<typeof Branch>;
