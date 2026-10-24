// Informations affichées dans le pied de page. Un champ vide n'est pas affiché.
export const SITE = {
  presentation:
    "Le média de référence pour l'actualité guinéenne, africaine et mondiale. Analyses, vidéos et reportages.",
  directeurPublication: "",
  contact: {
    email: "",
    telephone: "",
    whatsapp: "",
    adresse: "",
  },
  reseaux: {
    facebook: "",
    youtube: "",
    tiktok: "",
    x: "",
    instagram: "",
    linkedin: "",
  },
};

export const RESEAUX_LABELS: Record<keyof typeof SITE.reseaux, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X (Twitter)",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};
