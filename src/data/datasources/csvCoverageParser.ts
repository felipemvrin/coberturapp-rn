import type { Antenna, GeoPoint, NetworkTechnology } from '../../domain/entities';
import { bearingBetween, distanceBetween } from '../../domain/geo';
import { directionFromBearing } from '../../domain/signal';

/**
 * Convierte coordenadas en formato DMS (ej. "33°24""54") o decimal a número.
 * Formato DMS: grados°minutos""segundos
 * Formato decimal: -33.43456
 */
function dmsToDecimal(coordStr: string): number {
  const cleaned = coordStr.trim().replace(/^"|"$/g, '');
  if (!cleaned) return Number.NaN;

  const decimalValue = Number(cleaned.replace(',', '.'));
  if (Number.isFinite(decimalValue) && !cleaned.includes('°')) {
    return decimalValue;
  }

  const normalized = cleaned
    .replace(/,/g, '.')
    .replace(/º/g, '°')
    .replace(/[′’]/g, "'")
    .replace(/[″]/g, '"')
    .toUpperCase();
  const hemisphere = normalized.match(/[NSEW]/)?.[0];
  const dmsOnly = normalized.replace(/[NSEW]/g, '').trim();
  const match = dmsOnly.match(
    /^(-?\d+(?:\.\d+)?)\s*°\s*(\d+(?:\.\d+)?)?\s*'?\s*(\d+(?:\.\d+)?)?\s*"?$/,
  );
  if (!match) return Number.NaN;

  const degrees = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  if (!Number.isFinite(degrees) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return Number.NaN;
  }

  const absolute = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  if (!Number.isFinite(absolute)) return Number.NaN;

  if (hemisphere === 'S' || hemisphere === 'W') {
    return -Number(absolute.toFixed(6));
  }
  if (hemisphere === 'N' || hemisphere === 'E') {
    return Number(absolute.toFixed(6));
  }
  return Number((Math.sign(degrees) < 0 ? -absolute : absolute).toFixed(6));
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes) {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else if (!current.length) {
        inQuotes = true;
      } else {
        current += char;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

/**
 * Asigna tecnología según la empresa (simplificado para pruebas).
 */
function getTechnologyByCarrier(carrier: string): NetworkTechnology {
  const upper = carrier.toUpperCase();
  if (upper.includes('CLARO')) return '5G';
  if (upper.includes('ENTEL')) return '4G+';
  if (upper.includes('MOVISTAR')) return '4G';
  if (upper.includes('WOM')) return '4G';
  if (upper.includes('VTR')) return '3G';
  return '4G';
}

interface CsvRow {
  nro: string;
  empresa: string;
  comuna: string;
  direccion: string;
  latitud: number;
  longitud: number;
}

/**
 * Parsea una línea CSV en un objeto con los campos extraídos.
 * Maneja coordenadas en formato decimal o DMS.
 */
export function parseAntennaRow(line: string): CsvRow | null {
  const fields = parseCsvLine(line).map((f) => f.trim());
  
  if (fields.length < 8) return null;

  const lat = dmsToDecimal(fields[6]);
  const lon = dmsToDecimal(fields[7]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }

  return {
    nro: fields[0],
    empresa: fields[3],
    comuna: fields[4],
    direccion: fields[5],
    latitud: lat,
    longitud: lon,
  };
}

/**
 * Transforma una fila CSV parseada a modelo Antenna.
 */
export function rowToAntenna(row: CsvRow, index: number, origin: GeoPoint): Antenna {
  const position: GeoPoint = {
    latitude: row.latitud,
    longitude: row.longitud,
  };

  const distance = distanceBetween(origin, position);
  const bearing = bearingBetween(origin, position);
  const direction = directionFromBearing(bearing);

  return {
    id: `antenna-${index}-${row.nro.replace(/\s+/g, '-')}`,
    name: row.direccion || `Antena ${row.empresa}`,
    carrier: row.empresa,
    technology: getTechnologyByCarrier(row.empresa),
    distanceMeters: distance,
    bearingDegrees: bearing,
    direction,
    position,
  };
}

/**
 * Parsea un CSV completo y devuelve un array de Antenna.
 */
export function parseAntennasCsv(csvContent: string, origin: GeoPoint): Antenna[] {
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());
  
  if (lines.length < 2) return []; // Al menos header + 1 fila

  // Saltar el header (línea 0)
  const antennas: Antenna[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = parseAntennaRow(lines[i]);
    if (row) {
      antennas.push(rowToAntenna(row, i, origin));
    }
  }
  
  return antennas;
}
