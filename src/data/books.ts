import type { BookData } from '@/types/game'

export const BOOKS: BookData[] = [
  // --- KAI ---
  { id: 1, cycle: 'kai', title: { fr: 'La Fuite vers la Mort', en: 'Flight from the Dark' }, maxDisciplines: 5 },
  { id: 2, cycle: 'kai', title: { fr: 'Le Feu sur les Eaux', en: 'Fire on the Water' }, maxDisciplines: 6 },
  { id: 3, cycle: 'kai', title: { fr: 'Les Cavernes de Kalte', en: 'The Caverns of Kalte' }, maxDisciplines: 7 },
  { id: 4, cycle: 'kai', title: { fr: 'L\'Abîme du Destin', en: 'The Chasm of Doom' }, maxDisciplines: 8 },
  { id: 5, cycle: 'kai', title: { fr: 'L\'Ombre dans le Désert', en: 'Shadow on the Sand' }, maxDisciplines: 9 },
  // --- MAGNAKAI ---
  { id: 6, cycle: 'magnakai', title: { fr: 'Les Royaumes de la Terreur', en: 'The Kingdoms of Terror' }, maxDisciplines: 5 },
  { id: 7, cycle: 'magnakai', title: { fr: 'Le Château de la Mort', en: 'Castle Death' }, maxDisciplines: 6 },
  { id: 8, cycle: 'magnakai', title: { fr: 'La Jungle des Horreurs', en: 'The Jungle of Horrors' }, maxDisciplines: 7 },
  { id: 9, cycle: 'magnakai', title: { fr: 'Le Chaudron de la Peur', en: 'The Cauldron of Fear' }, maxDisciplines: 8 },
  { id: 10, cycle: 'magnakai', title: { fr: 'Les Donjons de Torgar', en: 'The Dungeons of Torgar' }, maxDisciplines: 9 },
  { id: 11, cycle: 'magnakai', title: { fr: 'Les Prisonniers du Temps', en: 'The Prisoners of Time' }, maxDisciplines: 10 },
  { id: 12, cycle: 'magnakai', title: { fr: 'Les Maîtres des Ténèbres', en: 'The Masters of Darkness' }, maxDisciplines: 10 },
  // --- GRAND MASTER ---
  { id: 13, cycle: 'grandmaster', title: { fr: 'Les Seigneurs de la Peste', en: 'The Plague Lords of Ruel' }, maxDisciplines: 4 },
  { id: 14, cycle: 'grandmaster', title: { fr: 'Les Captifs de Kaag', en: 'The Captives of Kaag' }, maxDisciplines: 5 },
  { id: 15, cycle: 'grandmaster', title: { fr: 'La Croisade des Ténèbres', en: 'The Darke Crusade' }, maxDisciplines: 6 },
  { id: 16, cycle: 'grandmaster', title: { fr: 'L\'Héritage de Vashna', en: 'The Legacy of Vashna' }, maxDisciplines: 7 },
  { id: 17, cycle: 'grandmaster', title: { fr: 'Le Seigneur de Mort d\'Ixia', en: 'The Deathlord of Ixia' }, maxDisciplines: 8 },
  { id: 18, cycle: 'grandmaster', title: { fr: 'L\'Aube des Dragons', en: 'Dawn of the Dragons' }, maxDisciplines: 9 },
  { id: 19, cycle: 'grandmaster', title: { fr: 'Le Bane du Loup', en: "Wolf's Bane" }, maxDisciplines: 10 },
  { id: 20, cycle: 'grandmaster', title: { fr: 'La Malédiction de Naar', en: 'The Curse of Naar' }, maxDisciplines: 11 },
  // --- NEW ORDER ---
  { id: 21, cycle: 'neworder', title: { fr: 'Le Voyage de la Pierre de Lune', en: 'Voyage of the Moonstone' }, maxDisciplines: 5 },
  { id: 22, cycle: 'neworder', title: { fr: 'Les Boucaniers de Shadaki', en: 'The Buccaneers of Shadaki' }, maxDisciplines: 6 },
  { id: 23, cycle: 'neworder', title: { fr: 'Le Héros de Mydnight', en: "Mydnight's Hero" }, maxDisciplines: 7 },
  { id: 24, cycle: 'neworder', title: { fr: 'Guerre des Runes', en: 'Rune War' }, maxDisciplines: 8 },
  { id: 25, cycle: 'neworder', title: { fr: 'La Piste du Loup', en: 'Trail of the Wolf' }, maxDisciplines: 9 },
  { id: 26, cycle: 'neworder', title: { fr: 'La Chute de la Montagne de Sang', en: 'The Fall of Blood Mountain' }, maxDisciplines: 10 },
  { id: 27, cycle: 'neworder', title: { fr: 'Vampirium', en: 'Vampirium' }, maxDisciplines: 11 },
  { id: 28, cycle: 'neworder', title: { fr: 'La Faim de Sejanoz', en: 'The Hunger of Sejanoz' }, maxDisciplines: 12 },
  { id: 29, cycle: 'neworder', title: { fr: 'Les Tempêtes de Chai', en: 'The Storms of Chai' }, maxDisciplines: 13 },
  { id: 30, cycle: 'neworder', title: { fr: 'Morts dans les Profondeurs', en: 'Dead in the Deep' }, maxDisciplines: 14 },
  { id: 31, cycle: 'neworder', title: { fr: 'Le Crépuscule de la Nuit Éternelle', en: 'The Dusk of Eternal Night' }, maxDisciplines: 15 },
  { id: 32, cycle: 'neworder', title: { fr: 'Lumière du Kaï Vol. 1', en: 'Light of the Kai Vol. 1' }, maxDisciplines: 16 },
]

export const BOOKS_BY_CYCLE = {
  kai: BOOKS.filter(b => b.cycle === 'kai'),
  magnakai: BOOKS.filter(b => b.cycle === 'magnakai'),
  grandmaster: BOOKS.filter(b => b.cycle === 'grandmaster'),
  neworder: BOOKS.filter(b => b.cycle === 'neworder'),
}

export const CYCLE_LAST_BOOK: Record<string, number> = {
  kai: 5,
  magnakai: 12,
  grandmaster: 20,
  neworder: 32,
}

export const CYCLE_FIRST_BOOK: Record<string, number> = {
  kai: 1,
  magnakai: 6,
  grandmaster: 13,
  neworder: 21,
}

export function getBook(id: number): BookData | undefined {
  return BOOKS.find(b => b.id === id)
}

export function getCycleForBook(bookId: number): string {
  return BOOKS.find(b => b.id === bookId)?.cycle ?? 'kai'
}
