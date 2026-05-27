import { faCat, faGhost, faRobot, faDragon, faHatWizard } from '@fortawesome/free-solid-svg-icons';

export const PROFILE_ICONS = [
  { id: '1', icon: faCat,       label: 'Gato'     },
  { id: '2', icon: faGhost,     label: 'Fantasma' },
  { id: '3', icon: faRobot,     label: 'Robot'    },
  { id: '4', icon: faDragon,    label: 'Dragón'   },
  { id: '5', icon: faHatWizard, label: 'Mago'     },
];

export function getProfileIcon(id: string | null | undefined) {
  return PROFILE_ICONS.find(p => p.id === id)?.icon ?? faCat;
}
