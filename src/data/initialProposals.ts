import { Proposal } from '../types';

export const initialProposals: Proposal[] = [
  {
    id: '1',
    title: 'Plataforma de Transparencia Digital',
    description: 'Crear un portal donde los ciudadanos puedan consultar en tiempo real el uso de recursos públicos y avances de proyectos gubernamentales.',
    category: 'Gobierno',
    votes: 127,
    createdAt: new Date('2026-02-15'),
  },
  {
    id: '2',
    title: 'Becas para Investigación en IA',
    description: 'Programa de becas para estudiantes de posgrado enfocados en inteligencia artificial aplicada a problemas sociales.',
    category: 'Academia',
    votes: 89,
    createdAt: new Date('2026-02-16'),
  },
  {
    id: '3',
    title: 'Red de Startups Sociales',
    description: 'Incubadora de empresas que generen impacto social positivo con apoyo de mentoría y financiamiento semilla.',
    category: 'Empresa',
    votes: 156,
    createdAt: new Date('2026-02-14'),
  },
  {
    id: '4',
    title: 'Espacios Verdes Comunitarios',
    description: 'Rehabilitación de áreas abandonadas para convertirlas en parques y jardines gestionados por vecinos.',
    category: 'Comunidad',
    votes: 203,
    createdAt: new Date('2026-02-13'),
  },
  {
    id: '5',
    title: 'Digitalización de Trámites',
    description: 'Migrar todos los trámites gubernamentales a plataformas digitales para reducir tiempos y costos.',
    category: 'Gobierno',
    votes: 178,
    createdAt: new Date('2026-02-17'),
  },
  {
    id: '6',
    title: 'Laboratorios Ciudadanos de Innovación',
    description: 'Espacios públicos equipados donde la comunidad pueda experimentar con tecnología y desarrollar proyectos.',
    category: 'Academia',
    votes: 95,
    createdAt: new Date('2026-02-18'),
  },
];
