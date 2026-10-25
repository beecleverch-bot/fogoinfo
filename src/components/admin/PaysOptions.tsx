import { PAYS_GROUPES } from "@/lib/categories";

// Options d'un <select> de pays, groupées par continent. Une valeur absente
// de la liste (pays saisi avant) est gardée en tête pour ne pas la perdre.
export function PaysOptions({ actuel }: { actuel?: string | null }) {
  const connu = PAYS_GROUPES.some((g) => g.pays.includes(actuel ?? ""));
  return (
    <>
      {actuel && !connu && <option value={actuel}>{actuel}</option>}
      {PAYS_GROUPES.map((g) => (
        <optgroup key={g.groupe} label={g.groupe}>
          {g.pays.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}
