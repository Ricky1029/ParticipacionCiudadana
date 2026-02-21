export type Helix = 'Gobierno' | 'Academia' | 'Empresa' | 'Comunidad';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: Helix;
  votes: number;
  createdAt: Date;
}
