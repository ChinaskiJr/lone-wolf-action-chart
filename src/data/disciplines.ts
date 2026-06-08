import type {
  DisciplineData,
  GrandMasterDiscipline,
  KaiDiscipline,
  MagnakaiDiscipline,
} from '@/types/game'

export const KAI_DISCIPLINES: Record<KaiDiscipline, DisciplineData> = {
  camouflage: {
    key: 'camouflage',
    fr: 'Camouflage',
    en: 'Camouflage',
    effectFr: 'Se fondre dans l\'environnement ; passer pour un local en ville.',
    effectEn: 'Blend into surroundings; pass as a local in towns.',
  },
  hunting: {
    key: 'hunting',
    fr: 'Chasse',
    en: 'Hunting',
    effectFr: 'Trouver de la nourriture en milieu sauvage ; aucune Ration consommée hors des cités.',
    effectEn: 'Find food in wilderness; no Meal consumption needed outside cities.',
  },
  sixthSense: {
    key: 'sixthSense',
    fr: 'Sixième Sens',
    en: 'Sixth Sense',
    effectFr: 'Avertissement du danger ; révèle les intentions des étrangers.',
    effectEn: 'Warns of danger; reveals intentions of strangers.',
  },
  tracking: {
    key: 'tracking',
    fr: 'Orientation',
    en: 'Tracking',
    effectFr: 'Naviguer en milieu sauvage ; localiser des personnes ; lire les traces.',
    effectEn: 'Navigate wilderness; locate persons; read tracks.',
  },
  healing: {
    key: 'healing',
    fr: 'Guérison',
    en: 'Healing',
    effectFr: 'Récupère 1 PE par section hors combat.',
    effectEn: 'Restore 1 EP per section without combat.',
  },
  weaponskill: {
    key: 'weaponskill',
    fr: 'Maîtrise des Armes',
    en: 'Weaponskill',
    effectFr: '+2 HC si l\'arme maîtrisée est portée (1 type d\'arme, tiré au hasard).',
    effectEn: '+2 CS when carrying mastered weapon type (1 type, random).',
  },
  mindshield: {
    key: 'mindshield',
    fr: 'Bouclier Psychique',
    en: 'Mindshield',
    effectFr: 'Aucune perte de PE due aux attaques psychiques / Puissance Psychique.',
    effectEn: 'No EP loss from Mindblast or psychic attacks.',
  },
  mindblast: {
    key: 'mindblast',
    fr: 'Puissance Psychique',
    en: 'Mindblast',
    effectFr: '+2 HC via attaque psychique (certains ennemis sont immunisés).',
    effectEn: '+2 CS via psychic attack (some enemies immune).',
  },
  animalKinship: {
    key: 'animalKinship',
    fr: 'Communication Animale',
    en: 'Animal Kinship',
    effectFr: 'Communiquer avec les animaux ; percevoir leurs intentions.',
    effectEn: 'Communicate with animals; perceive intentions.',
  },
  mindOverMatter: {
    key: 'mindOverMatter',
    fr: 'Maîtrise Psychique de la Matière',
    en: 'Mind Over Matter',
    effectFr: 'Déplacer télékinétiquement de petits objets.',
    effectEn: 'Telekinetically move small objects.',
  },
}

export const MAGNAKAI_DISCIPLINES: Record<MagnakaiDiscipline, DisciplineData> = {
  weaponmastery: {
    key: 'weaponmastery',
    fr: 'Science des Armes',
    en: 'Weaponmastery',
    effectFr: '+3 HC avec les armes maîtrisées (jusqu\'à 3 types) ; +3 aux jets d\'arc.',
    effectEn: '+3 CS with mastered weapons (up to 3 types); +3 to bow rolls.',
  },
  animalControl: {
    key: 'animalControl',
    fr: 'Contrôle Animal',
    en: 'Animal Control',
    effectFr: 'Communiquer avec la plupart des animaux ; combattre efficacement à cheval.',
    effectEn: 'Communicate with most animals; fight effectively from horseback.',
  },
  curing: {
    key: 'curing',
    fr: 'Science Médicale',
    en: 'Curing',
    effectFr: 'Récupère 1 PE par section hors combat ; soigne maladie, cécité, poison.',
    effectEn: 'Restore 1 EP per section; cure disease, blindness, poison.',
  },
  invisibility: {
    key: 'invisibility',
    fr: 'Invisibilité',
    en: 'Invisibility',
    effectFr: 'Camouflage avancé masquant chaleur, odeur et son ; adopter des dialectes locaux.',
    effectEn: 'Advanced blending masking heat, scent, sound; adopt local dialects.',
  },
  huntmastery: {
    key: 'huntmastery',
    fr: 'Art de la Chasse',
    en: 'Huntmastery',
    effectFr: 'Chasser partout (désert inclus) ; agilité accrue ; éviter le malus de surprise au HC.',
    effectEn: 'Hunt anywhere; enhanced agility; avoid surprise CS penalty.',
  },
  pathsmanship: {
    key: 'pathsmanship',
    fr: 'Exploration',
    en: 'Pathsmanship',
    effectFr: 'Lire les langues étrangères ; détecter les pièges ; boussole instinctive.',
    effectEn: 'Read foreign languages; detect traps; instinctive compass.',
  },
  psiSurge: {
    key: 'psiSurge',
    fr: 'Foudroiement Psychique',
    en: 'Psi-surge',
    effectFr: '+4 HC (coûte 2 PE/round) ou variante faible +2 HC sans coût.',
    effectEn: '+4 CS (costs 2 EP/round); weaker variant +2 CS at no cost.',
  },
  psiScreen: {
    key: 'psiScreen',
    fr: 'Écran Psychique',
    en: 'Psi-screen',
    effectFr: 'Immunité totale aux forces mentales ; résistance aux illusions et à l\'hypnose.',
    effectEn: 'Full immunity to Mindforce; resist illusions and hypnosis.',
  },
  nexus: {
    key: 'nexus',
    fr: 'Nexus',
    en: 'Nexus',
    effectFr: 'Résister aux températures extrêmes ; télékinésie.',
    effectEn: 'Withstand extreme temperatures; telekinesis.',
  },
  divination: {
    key: 'divination',
    fr: 'Intuition',
    en: 'Divination',
    effectFr: 'Détecter les ennemis invisibles ; communication télépathique ; voyage astral limité.',
    effectEn: 'Detect invisible enemies; telepathic communication; limited spirit-walk.',
  },
}

export const GRAND_MASTER_DISCIPLINES: Record<GrandMasterDiscipline, DisciplineData> = {
  grandWeaponmastery: {
    key: 'grandWeaponmastery',
    fr: 'G.D. de la Science des Armes',
    en: 'Grand Weaponmastery',
    effectFr: '+5 HC avec les armes maîtrisées ; gagne 1 type d\'arme supplémentaire par livre.',
    effectEn: '+5 CS with mastered weapons; gain 1 additional weapon type per book.',
  },
  animalMastery: {
    key: 'animalMastery',
    fr: 'G.D. du Contrôle Animal',
    en: 'Animal Mastery',
    effectFr: 'Contrôler les créatures non-sentientes hostiles ; converser avec oiseaux et poissons.',
    effectEn: 'Control hostile non-sentient creatures; converse with birds and fish.',
  },
  deliverance: {
    key: 'deliverance',
    fr: 'G.D. de la Science Médicale',
    en: 'Deliverance',
    effectFr: 'Récupère 20 PE si réduit à 8 ou moins en combat (une fois par 20 jours).',
    effectEn: 'Restore 20 EP when reduced to 8 or below in combat (once per 20 days).',
  },
  assimilance: {
    key: 'assimilance',
    fr: 'G.D. de l\'Invisibilité',
    en: 'Assimilance',
    effectFr: 'Changer d\'apparence physique pour 1–3 jours ; camouflage en terrain découvert.',
    effectEn: 'Change physical appearance for 1–3 days; advanced open-ground camouflage.',
  },
  grandHuntmastery: {
    key: 'grandHuntmastery',
    fr: 'G.D. de l\'Art de la Chasse',
    en: 'Grand Huntmastery',
    effectFr: 'Voir dans l\'obscurité totale ; toucher et goût aiguisés ; aucune Ration nécessaire.',
    effectEn: 'See in total darkness; heightened senses; eliminate Meal requirement.',
  },
  grandPathsmanship: {
    key: 'grandPathsmanship',
    fr: 'G.D. de l\'Exploration',
    en: 'Grand Pathsmanship',
    effectFr: 'Résister aux plantes hostiles ; super-conscience des embuscades en forêt.',
    effectEn: 'Resist hostile plant entrapment; super-awareness of woodland ambush.',
  },
  kaiSurge: {
    key: 'kaiSurge',
    fr: 'G.D. du Foudroiement Psychique',
    en: 'Kai-surge',
    effectFr: '+8 HC (coûte 1 PE/round) ou variante +4 HC sans coût.',
    effectEn: '+8 CS in psychic attack (1 EP/round); weaker variant +4 CS at no cost.',
  },
  kaiScreen: {
    key: 'kaiScreen',
    fr: 'G.D. de l\'Écran Psychique',
    en: 'Kai-screen',
    effectFr: 'Fortifications mentales protégeant soi et ses alliés ; masquer les auras.',
    effectEn: 'Mind-fortresses protecting self and allies; mask auras.',
  },
  grandNexus: {
    key: 'grandNexus',
    fr: 'G.D. du Nexus',
    en: 'Grand Nexus',
    effectFr: 'Résister aux flammes, acides et éléments nocifs pendant une heure.',
    effectEn: 'Withstand flames, acids, and harmful elements for up to an hour.',
  },
  telegnosis: {
    key: 'telegnosis',
    fr: 'G.D. de l\'Intuition',
    en: 'Telegnosis',
    effectFr: 'Voyage astral étendu avec durée accrue et moins d\'effets secondaires.',
    effectEn: 'Extended spirit-walk for far greater duration with fewer ill effects.',
  },
  magiMagic: {
    key: 'magiMagic',
    fr: 'G.D. de la Magie des Anciens',
    en: 'Magi-magic',
    effectFr: 'Sorts du Vieux Royaume : Bouclier, Mot de Pouvoir, Poing Invisible.',
    effectEn: 'Old Kingdom spells: Shield, Power Word, Invisible Fist.',
  },
  kaiAlchemy: {
    key: 'kaiAlchemy',
    fr: 'G.D. de l\'Alchimie Kaï',
    en: 'Kai-alchemy',
    effectFr: 'Sorts de la Confrérie : Main d\'Éclair, Lévitation, Charme Mental.',
    effectEn: 'Brotherhood spells: Lightning Hand, Levitation, Mind Charm.',
  },
}

export const NEW_ORDER_EXTRA_DISCIPLINES: Record<string, DisciplineData> = {
  astrology: {
    key: 'astrology',
    fr: 'G.D. de l\'Astrologie',
    en: 'Astrology',
    effectFr: 'Prédire et influencer l\'avenir par étude céleste ; précision croissante avec le rang.',
    effectEn: 'Predict and shape the future via celestial study; improves with rank.',
  },
  herbmastery: {
    key: 'herbmastery',
    fr: 'G.D. de l\'Art des Simples',
    en: 'Herbmastery',
    effectFr: 'Identifier toute substance d\'origine organique ; propriétés médicinales et magiques.',
    effectEn: 'Identify any organic substance; unlock medicinal and magical properties.',
  },
  elementalism: {
    key: 'elementalism',
    fr: 'G.D. de l\'Élémentalisme',
    en: 'Elementalism',
    effectFr: 'Manipuler Terre, Air, Feu et Eau (murs, projections de roches, sable, etc.).',
    effectEn: 'Manipulate Earth, Air, Fire, and Water (walls, hurling rocks, spraying sand, etc.).',
  },
  bardsmanship: {
    key: 'bardsmanship',
    fr: 'G.D. du Don des Bardes',
    en: 'Bardsmanship',
    effectFr: 'Maîtriser n\'importe quel instrument ; influencer les émotions des créatures sentientes.',
    effectEn: 'Master any instrument; affect emotions of sentient creatures.',
  },
}

export const NEW_ORDER_DISCIPLINES: Record<string, DisciplineData> = {
  ...GRAND_MASTER_DISCIPLINES,
  ...NEW_ORDER_EXTRA_DISCIPLINES,
}

export const KAI_WEAPONS = [
  { key: 'dagger', fr: 'Dague', en: 'Dagger' },
  { key: 'spear', fr: 'Lance', en: 'Spear' },
  { key: 'mace', fr: 'Masse', en: 'Mace' },
  { key: 'shortSword', fr: 'Épée courte', en: 'Short Sword' },
  { key: 'warhammer', fr: 'Marteau de Guerre', en: 'Warhammer' },
  { key: 'sword', fr: 'Épée', en: 'Sword' },
  { key: 'axe', fr: 'Hache', en: 'Axe' },
  { key: 'quarterstaff', fr: 'Bâton', en: 'Quarterstaff' },
  { key: 'broadsword', fr: 'Glaive', en: 'Broadsword' },
]

// Magnakai/Grand Master weaponmastery includes all Kai weapons plus the bow.
export const MAGNAKAI_WEAPONS = [
  ...KAI_WEAPONS,
  { key: 'bow', fr: 'Arc', en: 'Bow' },
]
