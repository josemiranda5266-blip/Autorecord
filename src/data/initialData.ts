import {
  Vehicle,
  MaintenanceItem,
  Expense,
  DocumentRecord,
  MileageLog,
  Tip,
  MaintenanceType,
} from '../types';

export interface MaintenanceIntervalRule {
  type: MaintenanceType;
  intervalKm: number;
  intervalMonths: number;
  description: string;
}

export const DEFAULT_MAINTENANCE_RULES: MaintenanceIntervalRule[] = [
  {
    type: 'Cambio de aceite',
    intervalKm: 10000,
    intervalMonths: 12,
    description: 'Referencia general. Usar aceite de viscosidad recomendada por el fabricante.',
  },
  {
    type: 'Filtro de aceite',
    intervalKm: 10000,
    intervalMonths: 12,
    description: 'Reemplazar en cada cambio de aceite del motor.',
  },
  {
    type: 'Filtro de aire',
    intervalKm: 15000,
    intervalMonths: 12,
    description: 'Revisar con mayor frecuencia en caminos con polvo.',
  },
  {
    type: 'Filtro de combustible',
    intervalKm: 20000,
    intervalMonths: 24,
    description: 'Evita la llegada de impurezas a los inyectores.',
  },
  {
    type: 'Filtro de habitáculo',
    intervalKm: 15000,
    intervalMonths: 12,
    description: 'Mejora la calidad del aire del sistema de calefacción y AA.',
  },
  {
    type: 'Bujías',
    intervalKm: 30000,
    intervalMonths: 24,
    description: 'Bujías convencionales cada 30.000 km. Iridio/Platino suelen durar más.',
  },
  {
    type: 'Batería',
    intervalKm: 50000,
    intervalMonths: 36,
    description: 'Vida útil promedio de 2 a 3 años. Revisar carga y sulfatación de bornes.',
  },
  {
    type: 'Pastillas',
    intervalKm: 30000,
    intervalMonths: 24,
    description: 'Revisar espesor. Si escuchás chillidos o falta respuesta, consultar mecánico.',
  },
  {
    type: 'Líquido de frenos',
    intervalKm: 40000,
    intervalMonths: 24,
    description: 'Líquido higroscópico, absorbe humedad. Se recomienda sustituir cada 2 años.',
  },
  {
    type: 'Refrigerante',
    intervalKm: 40000,
    intervalMonths: 24,
    description: 'Usar fluido orgánico en proporción adecuada con agua desmineralizada.',
  },
  {
    type: 'Correa de distribución',
    intervalKm: 60000,
    intervalMonths: 48,
    description: 'Mantenimiento crítico en motores con correa. Incluye tensores y bomba de agua.',
  },
  {
    type: 'Alineación',
    intervalKm: 10000,
    intervalMonths: 12,
    description: 'Hacer junto con el rotado y balanceo de neumáticos.',
  },
  {
    type: 'Neumáticos',
    intervalKm: 50000,
    intervalMonths: 48,
    description: 'Rotar cada 10.000 km. Controlar desgaste y fecha de fabricación (DOT).',
  },
  {
    type: 'VTV/RTO',
    intervalKm: 0,
    intervalMonths: 12,
    description: 'Verificación Técnica Vehicular periódica obligatoria según jurisdicción.',
  },
  {
    type: 'Seguro',
    intervalKm: 0,
    intervalMonths: 12,
    description: 'Póliza y comprobante de pago al día obligatorios para circular.',
  },
];

export const INITIAL_TIPS: Tip[] = [
  {
    id: 'tip-1',
    category: 'aceite',
    title: 'Controlá el nivel de aceite regularmente',
    content:
      'Revisá el nivel con el vehículo estacionado en una superficie plana y con el motor frío. La varilla debe marcar entre el mínimo y el máximo. Para confirmar la causa de consumos atípicos se necesita un diagnóstico profesional.',
    iconName: 'Droplet',
    minMileage: 0,
  },
  {
    id: 'tip-2',
    category: 'neumáticos',
    title: 'Revisá la presión en frío',
    content:
      'Controlá periódicamente la presión de inflado (incluyendo el auxilio) respetando los valores indicados por el fabricante en la puerta o tapa de combustible.',
    iconName: 'Disc',
    minMileage: 0,
  },
  {
    id: 'tip-3',
    category: 'batería',
    title: 'Prestá atención a los arranques pesados',
    content:
      'Si el vehículo comienza a tener dificultades frecuentes para arrancar o las luces se atenúan en ralentí, conviene revisar la batería y el sistema de carga (alternador).',
    iconName: 'Zap',
    minMileage: 0,
  },
  {
    id: 'tip-4',
    category: 'refrigeración',
    title: 'Nunca abras el vaso de expansión con el motor caliente',
    content:
      'El sistema de refrigeración junta alta presión y temperatura. Nunca agregues agua de la canilla directamente, utilizá líquido refrigerante con agua desmineralizada.',
    iconName: 'Thermometer',
    minMileage: 0,
  },
  {
    id: 'tip-5',
    category: 'frenos',
    title: 'Chillidos o pedal esponjoso',
    content:
      'Un chillido agudo al frenar suele indicar desgaste en las pastillas. Si el pedal se siente esponjoso, puede haber aire o humedad en el circuito. En frenos, siempre hacé revisar el vehículo por un especialista.',
    iconName: 'ShieldAlert',
    minMileage: 0,
  },
  {
    id: 'tip-6',
    category: 'motor',
    title: 'Vehículos con alto kilometraje (> 150.000 km)',
    content:
      'Con kilometrajes elevados es recomendable prestar especial atención al sistema de refrigeración, estado de correas, mangueras, amortiguación y eventuales pérdidas de fluidos.',
    iconName: 'Gauge',
    minMileage: 150000,
  },
  {
    id: 'tip-7',
    category: 'combustible',
    title: 'No circules de manera constante en reserva',
    content:
      'Manejar frecuentemente con poco combustible puede sobrecalentar la bomba sumergida y arrastrar sedimentos acumulados en el fondo del tanque hacia los filtros e inyectores.',
    iconName: 'Fuel',
    minMileage: 0,
  },
  {
    id: 'tip-8',
    category: 'conducción',
    title: 'Manejo preventivo para ahorrar combustible',
    content:
      'Evitá aceleraciones bruscas y frenadas de golpe. Mantener velocidades constantes y usar la marcha adecuada reduce notablemente el consumo y el desgaste mecánico.',
    iconName: 'Sparkles',
    minMileage: 0,
  },
  {
    id: 'tip-9',
    category: 'viajes',
    title: 'Chequeo exprés antes de salir a la ruta',
    content:
      'Antes de viajar verificá: fluido de frenos, aceite, refrigerante, limpiaparabrisas, presión de neumáticos, luces completas, matafuego cargado y documentación al día.',
    iconName: 'MapPin',
    minMileage: 0,
  },
  {
    id: 'tip-10',
    category: 'aire acondicionado',
    title: 'Encendé el aire también en invierno',
    content:
      'Encender el aire acondicionado 10 minutos al mes ayuda a mantener lubricados los sellos y mangueras del compresor, evitando fugas de gas refrigerante.',
    iconName: 'Wind',
    minMileage: 0,
  },
  {
    id: 'tip-11',
    category: 'limpieza',
    title: 'Lavado de chasis e interior',
    content:
      'Lavar la carrocería y la parte inferior previene la acumulación de barro y sales que aceleran la corrosión. Evitá usar hidrolavadoras directo a los componentes electrónicos del motor.',
    iconName: 'Sparkles',
    minMileage: 0,
  },
  {
    id: 'tip-12',
    category: 'mantenimiento preventivo',
    title: 'Registrá cada intervención',
    content:
      'Guardar las fechas, montos y kilómetros de cada service no solo cuida tu vehículo, sino que también aumenta sensiblemente su valor de reventa al demostrar un historial transparente.',
    iconName: 'CheckCircle2',
    minMileage: 0,
  },
];

// DEMO DATA (Renault Kangoo 1.6 16V 2011 Nafta 240.000 km)
export const DEMO_VEHICLE_ID = 'demo-kangoo-2011';
export const DEMO_USER_ID = 'demo-user-123';

export const DEMO_VEHICLE: Vehicle = {
  id: DEMO_VEHICLE_ID,
  userId: DEMO_USER_ID,
  brand: 'Renault',
  model: 'Kangoo',
  version: '1.6 16V Express',
  year: 2011,
  engine: '1.6 16V K4M',
  displacement: '1598 cc',
  fuelType: 'Nafta',
  transmission: 'Manual',
  licensePlate: 'AB123CD',
  vin: '8A1K4M11223344556',
  currentMileage: 240000,
  acquisitionDate: '2018-04-10',
  photoUrl:
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
  notes: 'Vehículo particular de uso mixto. Se realizan servicios preventivos periódicos.',
  isMain: true,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_MILEAGE_LOGS: MileageLog[] = [
  {
    id: 'ml-1',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    mileage: 235000,
    date: '2026-03-10',
    notes: 'Viaje a Córdoba',
    createdAt: new Date('2026-03-10').toISOString(),
  },
  {
    id: 'ml-2',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    mileage: 238500,
    date: '2026-06-01',
    notes: 'Control mensual',
    createdAt: new Date('2026-06-01').toISOString(),
  },
  {
    id: 'ml-3',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    mileage: 240000,
    date: '2026-08-01',
    notes: 'Actualización reciente',
    createdAt: new Date('2026-08-01').toISOString(),
  },
];

export const DEMO_MAINTENANCES: MaintenanceItem[] = [
  {
    id: 'maint-1',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Cambio de aceite',
    date: '2026-01-15',
    mileage: 230000,
    cost: 65000,
    workshop: 'Taller San José',
    description: 'Aceite 10W40 Semisintético + Filtro de aceite',
    notes: 'Próximo cambio programado a los 240.000 km',
    nextMileageDue: 240000,
    nextDateDue: '2026-08-15',
    isCompleted: false, // Currently overdue/due at 240.000 km!
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'maint-2',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Filtro de aire',
    date: '2025-11-20',
    mileage: 228000,
    cost: 18000,
    workshop: 'Lubricentro El Triángulo',
    description: 'Reemplazo filtro de aire y de habitáculo',
    nextMileageDue: 241500,
    nextDateDue: '2026-09-01',
    isCompleted: false, // Upcoming soon
    createdAt: new Date('2025-11-20').toISOString(),
  },
  {
    id: 'maint-3',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Pastillas',
    date: '2025-08-10',
    mileage: 220000,
    cost: 55000,
    workshop: 'Frenos Centro',
    description: 'Cambio pastillas de freno delanteras',
    nextMileageDue: 250000,
    nextDateDue: '2027-08-10',
    isCompleted: true,
    createdAt: new Date('2025-08-10').toISOString(),
  },
  {
    id: 'maint-4',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Correa de distribución',
    date: '2024-05-12',
    mileage: 190000,
    cost: 140000,
    workshop: 'Renault Oficial Service',
    description: 'Kit de distribución completo + bomba de agua y correa auxiliar',
    nextMileageDue: 250000,
    nextDateDue: '2028-05-12',
    isCompleted: true,
    createdAt: new Date('2024-05-12').toISOString(),
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    date: '2026-08-05',
    category: 'Combustible',
    amount: 45000,
    mileage: 239700,
    description: 'Carga de Nafta Súper YPF',
    createdAt: new Date('2026-08-05').toISOString(),
  },
  {
    id: 'exp-2',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    date: '2026-08-01',
    category: 'Seguro',
    amount: 45000,
    mileage: 239500,
    description: 'Cuota mensual Seguro Contra Todo Riesgo',
    createdAt: new Date('2026-08-01').toISOString(),
  },
  {
    id: 'exp-3',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    date: '2026-07-20',
    category: 'Combustible',
    amount: 42000,
    mileage: 239000,
    description: 'Carga de Nafta Súper Shell',
    createdAt: new Date('2026-07-20').toISOString(),
  },
  {
    id: 'exp-4',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    date: '2026-07-10',
    category: 'Lavado',
    amount: 15000,
    mileage: 238800,
    description: 'Lavado completo e higienización de tapizados',
    createdAt: new Date('2026-07-10').toISOString(),
  },
  {
    id: 'exp-5',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    date: '2026-06-15',
    category: 'Estacionamiento',
    amount: 25000,
    mileage: 238000,
    description: 'Cochera mensual Microcentro',
    createdAt: new Date('2026-06-15').toISOString(),
  },
];

export const DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-1',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'VTV/RTO',
    title: 'Verificación Técnica Vehicular',
    expirationDate: '2026-08-29', // 18 days from Aug 11 2026!
    observations: 'Planta VTV San Martín - Oblea #98421',
    createdAt: new Date('2025-08-29').toISOString(),
  },
  {
    id: 'doc-2',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Seguro',
    title: 'Póliza La Segunda Seguros',
    expirationDate: '2026-09-15',
    observations: 'Cobertura C3 con auxilio mecánico de hasta 300 km',
    createdAt: new Date('2025-09-15').toISOString(),
  },
  {
    id: 'doc-3',
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    type: 'Licencia',
    title: 'Licencia Nacional de Conducir (B1)',
    expirationDate: '2028-11-10',
    observations: 'Categoría B1 automóviles y camionetas particulares',
    createdAt: new Date('2023-11-10').toISOString(),
  },
];
