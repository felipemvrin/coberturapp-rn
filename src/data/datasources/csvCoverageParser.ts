import type { Antenna, GeoPoint, NetworkTechnology } from '../../domain/entities';
import { bearingBetween, distanceBetween } from '../../domain/geo';
import { directionFromBearing } from '../../domain/signal';

/**
 * Convierte coordenadas en formato DMS (ej. "33°24""54") o decimal a número.
 * Formato DMS: grados°minutos""segundos
 * Formato decimal: -33.43456
 */
function dmsToDecimal(coordStr: string): number {
  const cleaned = coordStr.trim();
  
  // Si ya es decimal (tiene punto), devolverlo directamente
  if (cleaned.includes('.') && !cleaned.includes('°')) {
    return parseFloat(cleaned);
  }
  
  // Si es DMS, parsear
  let result = parseFloat(cleaned);
  
  // Remover comillas de inicio/fin si existen
  let working = cleaned;
  if (working.startsWith('"')) working = working.slice(1);
  if (working.endsWith('"')) working = working.slice(0, -1);
  
  // Dividir por grados
  const parts = working.split('°');
  if (parts.length < 2) return result;
  
  const degrees = parseFloat(parts[0]);
  
  // El resto contiene minutos y segundos
  const rest = parts[1].trim();
  
  // Dividir por " (comilla doble) o ' (comilla simple)
  const restNormalized = rest.replace(/"/g, '.');
  const timeParts = restNormalized.split('.');
  
  const minutes = parseFloat(timeParts[0]) || 0;
  const seconds = parseFloat(timeParts[1]) || 0;
  
  result = Math.round((degrees + minutes / 60 + seconds / 3600) * 1000000) / 1000000;
  return result;
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
  const fields = line.split(',').map(f => f.trim());
  
  if (fields.length < 8) return null;
  
  try {
    const latStr = fields[6];
    const lonStr = fields[7];
    
    let lat = dmsToDecimal(latStr);
    let lon = dmsToDecimal(lonStr);
    
    // Si no son negativos (formato DMS antiguo), hacerlos negativos
    if (lat > 0) lat = -lat;
    if (lon > 0) lon = -lon;
    
    return {
      nro: fields[0],
      empresa: fields[3],
      comuna: fields[4],
      direccion: fields[5],
      latitud: lat,
      longitud: lon,
    };
  } catch (e) {
    console.warn('Error parsing antenna row:', line, e);
    return null;
  }
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
  const lines = csvContent.split('\n').filter(line => line.trim());
  
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
