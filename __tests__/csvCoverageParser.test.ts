import { parseAntennaRow } from '../src/data/datasources/csvCoverageParser';

describe('csvCoverageParser', () => {
  it('parsea coordenadas decimales', () => {
    const row = parseAntennaRow(
      '1,01/01/2024,01/01/2024,MOVISTAR MOVIL,Recoleta,Estación Metro Patronato,-33.4366,-70.6389',
    );

    expect(row).not.toBeNull();
    expect(row?.latitud).toBeCloseTo(-33.4366, 6);
    expect(row?.longitud).toBeCloseTo(-70.6389, 6);
  });

  it('parsea coordenadas DMS con hemisferio y direcciones con coma', () => {
    const row = parseAntennaRow(
      `2,01/01/2024,01/01/2024,ENTEL PCS,Recoleta,"Av. Bellavista, 180",33°26'11"S,70°38'20"W`,
    );

    expect(row).not.toBeNull();
    expect(row?.direccion).toBe('Av. Bellavista, 180');
    expect(row?.latitud).toBeCloseTo(-33.436389, 6);
    expect(row?.longitud).toBeCloseTo(-70.638889, 6);
  });

  it('descarta coordenadas inválidas', () => {
    const row = parseAntennaRow('3,01/01/2024,01/01/2024,WOM,Recoleta,Dirección X,abc,xyz');
    expect(row).toBeNull();
  });
});
