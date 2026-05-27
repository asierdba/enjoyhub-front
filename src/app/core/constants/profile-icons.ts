import { faCat, faGhost, faRobot, faDragon, faHatWizard } from '@fortawesome/free-solid-svg-icons';

export const PROFILE_ICONS = [
  { id: '1', icon: faCat,       label: 'Cat'     },
  { id: '2', icon: faGhost,     label: 'Ghost' },
  { id: '3', icon: faRobot,     label: 'Robot'    },
  { id: '4', icon: faDragon,    label: 'Dragon'   },
  { id: '5', icon: faHatWizard, label: 'Wizard'     },
];

export function getProfileIcon(id: string | null | undefined) {
  return PROFILE_ICONS.find(icon => icon.id === id)?.icon ?? faCat;
}
