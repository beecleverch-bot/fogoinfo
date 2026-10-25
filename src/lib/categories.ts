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

// Pays proposés pour répartir le travail entre rédacteurs.
export const PAYS_GROUPES: { groupe: string; pays: string[] }[] = [
  { groupe: "Principaux", pays: ["Guinée", "Suisse"] },
  {
    groupe: "Afrique",
    pays: [
    "Afrique du Sud",
    "Algérie",
    "Angola",
    "Bénin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cameroun",
    "Cap-Vert",
    "Centrafrique",
    "Comores",
    "Congo",
    "Côte d'Ivoire",
    "Djibouti",
    "Égypte",
    "Érythrée",
    "Eswatini",
    "Éthiopie",
    "Gabon",
    "Gambie",
    "Ghana",
    "Guinée",
    "Guinée-Bissau",
    "Guinée équatoriale",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libye",
    "Madagascar",
    "Malawi",
    "Mali",
    "Maroc",
    "Maurice",
    "Mauritanie",
    "Mozambique",
    "Namibie",
    "Niger",
    "Nigeria",
    "Ouganda",
    "RD Congo",
    "Rwanda",
    "Sao Tomé-et-Principe",
    "Sénégal",
    "Seychelles",
    "Sierra Leone",
    "Somalie",
    "Soudan",
    "Soudan du Sud",
    "Tanzanie",
    "Tchad",
    "Togo",
    "Tunisie",
    "Zambie",
    "Zimbabwe",
    ],
  },
  {
    groupe: "Europe",
    pays: [
    "Albanie",
    "Allemagne",
    "Andorre",
    "Autriche",
    "Belgique",
    "Biélorussie",
    "Bosnie-Herzégovine",
    "Bulgarie",
    "Chypre",
    "Croatie",
    "Danemark",
    "Espagne",
    "Estonie",
    "Finlande",
    "France",
    "Grèce",
    "Hongrie",
    "Irlande",
    "Islande",
    "Italie",
    "Kosovo",
    "Lettonie",
    "Liechtenstein",
    "Lituanie",
    "Luxembourg",
    "Macédoine du Nord",
    "Malte",
    "Moldavie",
    "Monaco",
    "Monténégro",
    "Norvège",
    "Pays-Bas",
    "Pologne",
    "Portugal",
    "République tchèque",
    "Roumanie",
    "Royaume-Uni",
    "Russie",
    "Saint-Marin",
    "Serbie",
    "Slovaquie",
    "Slovénie",
    "Suède",
    "Suisse",
    "Ukraine",
    "Vatican",
    ],
  },
  { groupe: "Autres", pays: ["États-Unis", "Canada"] },
];
