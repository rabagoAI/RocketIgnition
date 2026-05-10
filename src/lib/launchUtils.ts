import { Colors } from './theme';

export function getLaunchStatusColor(abbrev: string): string {
  switch (abbrev) {
    case 'Go': return Colors.statusGo;
    case 'TBD':
    case 'TBC': return Colors.statusTbd;
    case 'Hold': return Colors.statusHold;
    case 'Success': return Colors.statusGo;
    case 'Failure':
    case 'Partial Failure': return Colors.primary;
    case 'In Flight': return Colors.accent;
    default: return Colors.statusHold;
  }
}

export function getLaunchStatusLabel(abbrev: string): string {
  switch (abbrev) {
    case 'Go': return 'CONFIRMADO';
    case 'TBD': return 'POR DEFINIR';
    case 'TBC': return 'TENTATIVO';
    case 'Hold': return 'EN ESPERA';
    case 'Success': return 'ÉXITO';
    case 'Failure': return 'FALLO';
    case 'Partial Failure': return 'FALLO PARCIAL';
    case 'In Flight': return 'EN VUELO';
    default: return abbrev;
  }
}

export function formatLaunchDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}
