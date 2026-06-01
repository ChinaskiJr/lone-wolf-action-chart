# Loup Solitaire — Feuille d'Aventure Interactive

Une feuille d'aventure web pour les livres-jeux **Loup Solitaire** de Joe Dever, republiés par [Holmgaard Press](https://shop-magnamund.com/). Conçue pour enchaîner les 32 livres depuis une seule instance, avec sauvegardes persistantes, transitions de cycle assistées et calculateur de combat intégré.

> Contrairement aux feuilles existantes (une par livre), cette application gère la progression complète du personnage à travers les 4 cycles et 32 livres de la série.

---

## Fonctionnalités

### Gestion du personnage
- **4 cycles** couverts : Kaï (1–5), Magnakaï (6–12), Grand Maître (13–20), Nouvel Ordre (21–32)
- Création de personnage guidée (wizard 4 étapes) pour chaque cycle
- Calcul automatique du rang selon les disciplines maîtrisées
- Suivi des Points de Vie avec barre interactive et boutons ±1

### Feuille d'aventure
- **Caractéristiques** : Habileté au Combat (base + bonus + total) et Points d'Endurance
- **Disciplines** : liste filtrée par cycle, effets affichés, cercles de connaissance Magnakaï, lorestones
- **Équipement** : armes (max 2), sac à dos (8 ou 10 emplacements), objets spéciaux (max 12)
- **Or & Rations** : compteur avec contrôles rapides ±1/±5/±10
- **Notes** : zone de texte libre pour les numéros de sections et annotations

### Sauvegardes
- Parties illimitées stockées en **localStorage**
- Export / Import JSON (sauvegarde externe, partage)
- Auto-sauvegarde 1,5 s après chaque modification
- Tri par date de dernière session

### Calculateur de combat
- Table de résolution officielle Loup Solitaire (ratios −11 à +11, dé 0–9)
- Générateur de nombre aléatoire intégré
- Application des dégâts en un clic (joueur et ennemi)
- Mode **Combat à mort** : simulation automatique jusqu'à la fin du combat

### Transitions de cycle
- **Kaï → Magnakaï** : conservation des disciplines Kaï, sélection des nouvelles disciplines
- **Magnakaï → Grand Maître** : recalcul optionnel des stats, bonus cercles de connaissance permanents, checklist des 10 objets autorisés au transfert
- **Grand Maître → Nouvel Ordre** : création d'un nouveau personnage, générateur de Nom Kaï

### Interface
- Thème sombre, couleur d'accent par cycle
- **Bilingue FR / EN** — bascule à la volée
- Responsive (desktop et tablette)

---

## Cycles et livres

| Cycle | Livres | Personnage | Disciplines |
|---|---|---|---|
| Kaï | 1–5 | Loup Solitaire | 10 disciplines Kaï |
| Magnakaï | 6–12 | Loup Solitaire | 10 disciplines Magnakaï + cercles de connaissance |
| Grand Maître | 13–20 | Loup Solitaire | 12 Grandes Disciplines |
| Nouvel Ordre | 21–32 | Nouveau Grand Maître Kaï | 16 Grandes Disciplines |

---

## Stack technique

| Outil | Rôle |
|---|---|
| [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) | Framework UI + typage strict |
| [Vite 8](https://vite.dev) | Build & dev server |
| [Tailwind CSS v4](https://tailwindcss.com) | Styles utilitaires |
| [Zustand](https://zustand-demo.pmnd.rs) | État global |
| [React Router v7](https://reactrouter.com) | Navigation |
| [react-i18next](https://react.i18next.com) | Internationalisation FR/EN |
| [Vitest](https://vitest.dev) | Tests unitaires |

---

## Lancer le projet

### Prérequis

- Node.js ≥ 18 (testé sur Node 22)
- npm ≥ 10

> **Utilisateurs WSL2** : travailler depuis le filesystem Linux (`~/...`) et non depuis `/mnt/c/`. Le filesystem Windows ne supporte pas les permissions Unix requises par npm.

### Installation

```bash
git clone git@github.com:ChinaskiJr/lone-wolf-action-chart.git
cd lone-wolf-action-chart
npm install
```

### Développement

```bash
npm run dev
# → http://localhost:5173
```

### Build de production

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test          # run once
npm run test:watch  # watch mode
```

---

## Structure du projet

```
src/
├── components/
│   ├── layout/       # AppShell, Header, LanguageSwitcher
│   ├── home/         # Écran d'accueil, cartes de sauvegarde
│   ├── creation/     # Wizard de création (4 étapes)
│   ├── sheet/        # Feuille d'aventure et ses panneaux
│   └── transition/   # Wizard de transition de cycle
├── data/             # Données statiques (livres, disciplines, rangs, table de combat)
├── store/            # Stores Zustand (character, saves, ui)
├── types/            # Types TypeScript (Character union type par cycle)
├── utils/            # Logique métier (combat, rangs, création de personnage)
├── hooks/            # useAutoSave
└── locales/          # Traductions fr.json / en.json
```

Le modèle de données central est un **union type discriminé** par cycle :

```typescript
type Character = KaiCharacter | MagnakaiCharacter | GrandMasterCharacter | NewOrderCharacter
```

Chaque cycle a ses propres champs (disciplines, lorestones, kaiName, etc.) tout en partageant une base commune (stats, équipement, or, notes).

---

## Données de jeu

Les données sont issues des éditions **[Holmgaard Press](https://shop-magnamund.com/)** (française) et du projet [Project Aon](https://www.projectaon.org) pour les règles anglaises de référence :

- Titres officiels FR fournis par les éditions Holmgaard Press
- Noms de disciplines FR officiels (Kaï, Magnakaï, Grandes Disciplines avec préfixe G.D.)
- Rangs officiels FR des 4 cycles avec seuils de disciplines corrects
- Table de résolution de combat officielle (ratios −11 à +11)
- Règles de transition de cycle (carry-over Magnakaï→GM : 10 objets autorisés)

---

## Roadmap

### Fait
- [x] Tests unitaires (table de combat, calcul de rang, transitions — 112 tests)
- [x] Sac à dos : description optionnelle et objets 2 emplacements
- [x] Carry-over Magnakaï → Grand Maître : transfert fidèle des objets avec leurs bonus
- [x] Affichage de la carte du livre courant sur la feuille d'aventure (livres 1–30)

### À venir
- [ ] Lancé de d10 sur la feuille d'aventure
- [ ] Gestion de la Maîtrise des Armes (armes multiples par cycle)
- [ ] Suivi des lorestones depuis la feuille de jeu
- [ ] PWA / mode hors-ligne
- [ ] Import depuis les feuilles Project Aon existantes

---

## Licence

Usage personnel. Les livres *Loup Solitaire* et leurs contenus sont la propriété de Joe Dever / [Holmgaard Press](https://shop-magnamund.com/).
