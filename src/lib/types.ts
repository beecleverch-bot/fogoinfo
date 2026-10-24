export type Article = {
  id: string;
  titre: string;
  soustitre: string | null;
  categorie: string;
  contenu: string | null;
  image_url: string | null;
  auteur: string | null;
  date_publication: string;
  vues: number;
  est_une: boolean;
  tags: string[];
  pays?: string | null;
};

export type Video = {
  id: string;
  titre: string;
  description: string | null;
  url_video: string;
  miniature_url: string | null;
  categorie: string | null;
  duree: string | null;
  vues: number;
  created_at: string;
};
