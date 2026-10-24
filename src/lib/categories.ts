// Rubriques du site. `slug` = URL, `categories` = valeurs du champ `categorie`
// des articles affichés dans la rubrique (null = toutes).
export type Rubrique = {
  slug: string;
  label: string;
  description: string;
  categories: string[] | null;
};

export const RUBRIQUES: Rubrique[] = [
  {
    slug: "actualites",
    label: "Actualités",
    description: "Toute l'actualité de la Guinée, de l'Afrique et du monde.",
    categories: null,
  },
  {
    slug: "politique",
    label: "Politique",
    description: "Vie politique, institutions et gouvernance.",
    categories: ["Politique"],
  },
  {
    slug: "economie",
    label: "Économie",
    description: "Marchés, entreprises, mines et finances.",
    categories: ["Économie"],
  },
  {
    slug: "societe",
    label: "Société",
    description: "Santé, éducation, vie quotidienne et faits de société.",
    categories: ["Société"],
  },
  {
    slug: "culture",
    label: "Culture",
    description: "Musique, arts, festivals et patrimoine.",
    categories: ["Culture"],
  },
  {
    slug: "international",
    label: "International",
    description: "La Guinée dans le monde et l'actualité internationale.",
    categories: ["International"],
  },
  {
    slug: "tribunes",
    label: "Tribunes",
    description: "Opinions, analyses et points de vue.",
    categories: ["Tribune", "Analyse"],
  },
];

// Valeurs proposées dans le formulaire d'administration.
export const CATEGORIES_ARTICLE = [
  "Actualités",
  "Politique",
  "Économie",
  "Société",
  "Culture",
  "International",
  "Tribune",
  "Analyse",
];

export const CATEGORIES_VIDEO = ["Reportage", "Interview", "Débat", "Documentaire"];

export function rubriqueFor(categorie: string): Rubrique | undefined {
  return RUBRIQUES.find((r) => r.categories?.includes(categorie));
}

export function getRubrique(slug: string): Rubrique | undefined {
  return RUBRIQUES.find((r) => r.slug === slug);
}
