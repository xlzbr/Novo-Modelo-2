import { CampusBuilding, CampusRoom, ScheduleOverride, CampusRouteStep, CampusPath } from '../types';

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'bloco-a',
    name: 'Bloco A — Ciências da Computação e Engenharia',
    code: 'BL-A',
    shortName: 'Bloco A',
    floorsCount: 3,
    floorsDesc: '3 pavimentos (Térreo ao 2º Andar)',
    departments: ['Engenharia da Computação', 'Ciência da Computação', 'Sistemas de Informação'],
    facilities: [
      'Sala 204 — Laboratório de Software II',
      'Sala 201 — Algoritmos e Programação',
      'Sala 102 — Teórica e Multimídia',
      'Sala 101 — Modelagem Matemática',
      'Laboratório de Sistemas Operacionais',
    ],
    directions: 'Entrada pelo Portão 1 (Boulevard Principal). Siga reto pelo jardim central, primeiro edifício à esquerda.',
    gate: 'Portão 1 (Boulevard)',
    accessibility: ['Rampas de acesso na entrada', 'Dois elevadores adaptados', 'Piso tátil até as salas', 'Sanitários acessíveis em todos os andares'],
    position3D: [-16, 0, -6],
    dimensions3D: [12, 6.2, 9],
    entrancePosition3D: [-9.5, 0, -6],
    colorHex: '#203A65',
    style: 'academic_glass',
  },
  {
    id: 'bloco-b',
    name: 'Bloco B — Tecnologia da Informação e Redes',
    code: 'BL-B',
    shortName: 'Bloco B',
    floorsCount: 4,
    floorsDesc: '4 pavimentos (Térreo ao 3º Andar)',
    departments: ['Redes de Computadores', 'Sistemas Distribuídos', 'Segurança da Informação'],
    facilities: [
      'Sala 302 — Banco de Dados e Análise',
      'Sala 201 — Machine Learning e IA',
      'Laboratório de Redes de Alta Performance',
      'Laboratório de Segurança Cibernética',
      'Centro Acadêmico de Tecnologia (Térreo)',
    ],
    directions: 'Entrada recomendada pelo Portão 1 ou 2. Edifício envidraçado à direita da Alameda das Palmeiras.',
    gate: 'Portão 1 (Boulevard)',
    accessibility: ['Rampa suave', 'Elevador panorâmico com anúncio de voz', 'Portas automáticas largas', 'Sinalização em braille'],
    position3D: [16, 0, -6],
    dimensions3D: [12, 7.5, 9],
    entrancePosition3D: [9.5, 0, -6],
    colorHex: '#2B4C82',
    style: 'tech_pavilion',
  },
  {
    id: 'bloco-c',
    name: 'Bloco C — Laboratórios e Matemática Aplicada',
    code: 'BL-C',
    shortName: 'Bloco C',
    floorsCount: 2,
    floorsDesc: '2 pavimentos (Térreo e 1º Andar)',
    departments: ['Matemática e Estatística', 'Robótica & Automação', 'Hardware & Arquitetura'],
    facilities: [
      'Sala 105 — Laboratório de Hardware e Robótica',
      'Sala 102 — Auditório Tecnológico e Seminários',
      'Laboratório de Inteligência Artificial',
      'Makerspace e Prototipagem Rápida',
    ],
    directions: 'Ao lado da Biblioteca Central, interligado pela passarela coberta de pedestres.',
    gate: 'Portão 1 (Boulevard)',
    accessibility: ['Acesso totalmente nivelado', 'Rampa de ligação coberta com a Biblioteca', 'Bancadas acessíveis nos laboratórios'],
    position3D: [-16, 0, 8],
    dimensions3D: [12, 5.2, 9],
    entrancePosition3D: [-9.5, 0, 8],
    colorHex: '#1E355B',
    style: 'contemporary_lab',
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca Central Universitária (BCU)',
    code: 'BCU',
    shortName: 'Biblioteca',
    floorsCount: 3,
    floorsDesc: '3 pavimentos silenciosos',
    departments: ['Acervo Físico e Digital', 'Salas de Pesquisa', 'Coordenação de Monografias'],
    facilities: [
      'Salas de Estudo em Grupo (1º Pavimento)',
      'Cabines Individuais Silenciosas (2º Pavimento)',
      'Terminal de Empréstimo e Autoatendimento (Térreo)',
      'Café Acadêmico e Espaço de Leitura ao Ar Livre',
    ],
    directions: 'Centro do campus universitário, em frente ao chafariz cívico.',
    gate: 'Portão 1 ou Portão 2',
    accessibility: ['Elevador para todos os pisos de acervo', 'Terminais com softwares de ampliação de tela e NVDA', 'Mesas com ajuste de altura'],
    position3D: [16, 0, 8],
    dimensions3D: [12, 6.4, 9.5],
    entrancePosition3D: [9.5, 0, 8],
    colorHex: '#182C4F',
    style: 'library_monument',
  },
  {
    id: 'reitoria',
    name: 'Prédio Central & Secretaria Acadêmica',
    code: 'PR-ADM',
    shortName: 'Reitoria',
    floorsCount: 4,
    floorsDesc: '4 pavimentos administrativos',
    departments: ['Secretaria Geral de Cursos', 'Protocolo e Diplomas', 'Coordenação Pedagógica', 'Reitoria'],
    facilities: [
      'Atendimento Presencial ao Aluno (Térreo)',
      'Gabinete de Professores e Atendimento Discente',
      'Auditório Nobre Universitário',
      'Tesouraria e Bolsas de Pesquisa',
    ],
    directions: 'Boulevard de entrada, no início da esplanada principal.',
    gate: 'Portão 1 (Principal)',
    accessibility: ['Rampas em conformidade NBR 9050', 'Dois elevadores centrais', 'Guichês de atendimento rebaixados'],
    position3D: [0, 0, -18],
    dimensions3D: [16, 7.5, 8],
    entrancePosition3D: [0, 0, -13.5],
    colorHex: '#162847',
    style: 'civic_admin',
  },
  {
    id: 'convivencia',
    name: 'Centro de Convivência & Praça Cívica',
    code: 'CC-VIV',
    shortName: 'Convivência',
    floorsCount: 1,
    floorsDesc: 'Pavimento térreo e área externa integrada',
    departments: ['Diretório Central dos Estudantes (DCE)', 'Apoio Comunitário', 'Alimentação'],
    facilities: [
      'Restaurante Universitário e Praça de Alimentação',
      'Papelaria e Centro de Impressões',
      'Agência Bancária Universitária',
      'Área verde de descanso e integração',
    ],
    directions: 'Parte sul do campus, ao lado da praça de eventos ao ar livre.',
    gate: 'Portão 2 (Acesso Sul)',
    accessibility: ['Piso 100% plano', 'Sanitários universais adaptados', 'Mesas acessíveis com espaço para cadeira de rodas'],
    position3D: [0, 0, 20],
    dimensions3D: [15, 4.0, 8],
    entrancePosition3D: [0, 0, 15.5],
    colorHex: '#254273',
    style: 'terrace_pavilion',
  },
];

export const CAMPUS_ROOMS: CampusRoom[] = [
  // Bloco A
  {
    id: 'room-bl-a-204',
    buildingId: 'bloco-a',
    code: 'Sala 204',
    name: 'Laboratório de Software II',
    floor: '2º Pavimento (Andar 2)',
    floorNumber: 2,
    type: 'laboratorio',
    capacity: 45,
    accessibilityNotes: 'Acesso via elevador central do Bloco A. Portas largas e bancadas ajustáveis com rotação de cadeiras.',
    equipment: ['45 Estações Intel Core i7 32GB', 'Projetor 4K Laser', 'Ar Condicionado Dual Inverter', 'Ponto de Rede Gigabit dedicado'],
  },
  {
    id: 'room-bl-a-201',
    buildingId: 'bloco-a',
    code: 'Sala 201',
    name: 'Laboratório de Algoritmos e Compiladores',
    floor: '2º Pavimento (Andar 2)',
    floorNumber: 2,
    type: 'laboratorio',
    capacity: 40,
    accessibilityNotes: 'Acesso por elevador ou escada central. Bancada frontal adaptada.',
    equipment: ['40 Workstations Linux Debian', 'Lousa Interativa', 'Quadro Branco Duplo'],
  },
  {
    id: 'room-bl-a-102',
    buildingId: 'bloco-a',
    code: 'Sala 102',
    name: 'Sala de Aulas Teóricas I',
    floor: '1º Pavimento (Andar 1)',
    floorNumber: 1,
    type: 'sala_teorica',
    capacity: 60,
    accessibilityNotes: 'Acesso por rampa ou elevador. Carteiras ergonômicas para destros e canhotos e espaço para PwD.',
    equipment: ['Projetor HDMI', 'Sistema de som ambiente com microfone sem fio'],
  },
  {
    id: 'room-bl-a-101',
    buildingId: 'bloco-a',
    code: 'Sala 101',
    name: 'Sala de Aulas Teóricas e Seminários',
    floor: '1º Pavimento (Andar 1)',
    floorNumber: 1,
    type: 'sala_teorica',
    capacity: 60,
    accessibilityNotes: 'Corredor plano com piso tátil integrado.',
    equipment: ['Projetor Full HD', 'Ar condicionado', 'Quadro magnético'],
  },

  // Bloco B
  {
    id: 'room-bl-b-302',
    buildingId: 'bloco-b',
    code: 'Sala 302',
    name: 'Laboratório de Banco de Dados e Big Data',
    floor: '3º Pavimento (Andar 3)',
    floorNumber: 3,
    type: 'laboratorio',
    capacity: 48,
    accessibilityNotes: 'Acesso por elevador panorâmico do Bloco B com sintetizador de voz.',
    equipment: ['Servidores locais PostgreSQL / MongoDB', '48 Estações de alta performance com monitores duplos'],
  },
  {
    id: 'room-bl-b-201',
    buildingId: 'bloco-b',
    code: 'Sala 201',
    name: 'Laboratório de Machine Learning e Inteligência Artificial',
    floor: '2º Pavimento (Andar 2)',
    floorNumber: 2,
    type: 'laboratorio',
    capacity: 36,
    accessibilityNotes: 'Piso elevado com rotas sem obstáculos e sinalização visual.',
    equipment: ['Servidores de GPU Nvidia RTX A5000', 'Bancadas de teste', 'Vídeo wall para visualização de dados'],
  },
  {
    id: 'room-bl-b-redes',
    buildingId: 'bloco-b',
    code: 'Lab Redes',
    name: 'Laboratório de Redes e Infraestrutura',
    floor: '1º Pavimento (Andar 1)',
    floorNumber: 1,
    type: 'laboratorio',
    capacity: 32,
    accessibilityNotes: 'Racks baixos acessíveis e piso antiestático.',
    equipment: ['Racks Cisco Switches e Roteadores', 'Analisadores de cabo Fluke', 'Pats de fibra óptica'],
  },

  // Bloco C
  {
    id: 'room-bl-c-105',
    buildingId: 'bloco-c',
    code: 'Sala 105',
    name: 'Laboratório de Hardware, Robótica e Estatística',
    floor: '1º Pavimento (Andar 1)',
    floorNumber: 1,
    type: 'laboratorio',
    capacity: 40,
    accessibilityNotes: 'Acesso térreo direto ou rampa suave. Sem desníveis.',
    equipment: ['Osciloscópios digitais', 'Kits FPGA e Arduino/ESP32', 'Estações de solda SMD seguras'],
  },
  {
    id: 'room-bl-c-102',
    buildingId: 'bloco-c',
    code: 'Sala 102',
    name: 'Sala de Seminários e Conferências Avançadas',
    floor: 'Térreo',
    floorNumber: 0,
    type: 'sala_teorica',
    capacity: 80,
    accessibilityNotes: 'Totalmente acessível no piso térreo. Espaço frontal reservado para cadeirantes.',
    equipment: ['Sistema de som surround', 'Câmeras PTZ para transmissão híbrida', 'Dois projetores simultâneos'],
  },

  // Biblioteca
  {
    id: 'room-bcu-estudos',
    buildingId: 'biblioteca',
    code: 'Salas de Estudo',
    name: 'Salas de Estudo em Grupo e Silêncio',
    floor: '2º Pavimento (Andar 2)',
    floorNumber: 2,
    type: 'biblioteca',
    capacity: 120,
    accessibilityNotes: 'Elevador de acesso ao 2º andar. Cabines com isolamento acústico e altura adaptada.',
    equipment: ['Terminais de pesquisa rápida', 'Tomadas e portas USB-C em todas as bancadas', 'Wi-Fi 6 de alta velocidade'],
  },

  // Reitoria
  {
    id: 'room-adm-secretaria',
    buildingId: 'reitoria',
    code: 'Secretaria',
    name: 'Secretaria Geral de Cursos e Registro Acadêmico',
    floor: 'Térreo',
    floorNumber: 0,
    type: 'administrativo',
    capacity: 50,
    accessibilityNotes: 'Balcão de atendimento prioritário em conformidade com NBR 9050.',
    equipment: ['Senhas eletrônicas', 'Posto de atendimento para emissão de certidões e histórico escolar'],
  },

  // Convivência
  {
    id: 'room-viv-ru',
    buildingId: 'convivencia',
    code: 'Praça de Alimentação',
    name: 'Restaurante Universitário & Centro de Lazer',
    floor: 'Térreo',
    floorNumber: 0,
    type: 'convivencia',
    capacity: 250,
    accessibilityNotes: 'Entrada ampla e plana com rampas de transição suaves.',
    equipment: ['Buffet acessível', 'Mesas dedicadas com altura livre de 75cm'],
  },
];

// Alterações excepcionais iniciais cadastradas pela Gestão Acadêmica
export const DEFAULT_SCHEDULE_OVERRIDES: ScheduleOverride[] = [
  {
    id: 'override-poo-manutencao',
    date: new Date().toISOString().split('T')[0], // Hoje
    disciplineId: 'disc-1',
    disciplineName: 'Programação Orientada a Objetos',
    originalBuildingId: 'bloco-a',
    originalRoom: 'Sala 204 — Bloco A',
    newBuildingId: 'bloco-c',
    newRoom: 'Sala 102 — Bloco C',
    reason: 'Manutenção técnica de climatização no Lab 204. Aula de hoje realocada preventivamente.',
    createdBy: 'Gestão Acadêmica / Coord. Prof. Me. Carlos Eduardo',
    createdAt: new Date().toISOString(),
  },
];

// Gerador sistemático de rota com etapas sequenciais e acessibilidade
export const generateRouteSteps = (
  building: CampusBuilding,
  roomCode: string,
  isElevatorPreferred: boolean = true
): CampusRouteStep[] => {
  const steps: CampusRouteStep[] = [];

  // Etapa 1: Portão de Entrada
  steps.push({
    stepNumber: 1,
    title: `Acesso ao Campus: ${building.gate}`,
    instruction: `Dirija-se ao ${building.gate}. As catracas contam com leitor biométrico, QR Code de estudante do Folium e portão lateral para acessibilidade.`,
    iconType: 'gate',
    isAccessible: true,
  });

  // Etapa 2: Trajeto a pé pelo campus
  steps.push({
    stepNumber: 2,
    title: `Caminho arborizado até o ${building.shortName}`,
    instruction: building.directions,
    iconType: 'walk',
    isAccessible: true,
  });

  // Etapa 3: Entrada do Edifício
  steps.push({
    stepNumber: 3,
    title: `Entrada do ${building.name}`,
    instruction: `Entre pelo saguão principal do ${building.shortName}. O totem interativo exibe o mural de avisos e a escala de salas do dia.`,
    iconType: 'entrance',
    isAccessible: true,
  });

  // Etapa 4: Deslocamento vertical (Elevador ou Escadas)
  if (building.floorsCount > 1) {
    if (isElevatorPreferred) {
      steps.push({
        stepNumber: 4,
        title: 'Acesso vertical por Elevador',
        instruction: `Utilize os elevadores à esquerda do hall de entrada. O elevador possui botoeira em braille, sinal sonoro de chegada e aviso de andar.`,
        iconType: 'elevator',
        isAccessible: true,
      });
    } else {
      steps.push({
        stepNumber: 4,
        title: 'Acesso vertical pelas Escadas Centrais',
        instruction: `Suba pelas escadas centrais com corrimão duplo e fita antiderrapante até o andar correspondente da aula.`,
        iconType: 'stairs',
        isAccessible: false,
      });
    }
  }

  // Etapa 5: Destino final
  steps.push({
    stepNumber: steps.length + 1,
    title: `Chegada ao destino: ${roomCode}`,
    instruction: `No corredor principal, siga a sinalização suspensa até a porta da ${roomCode}. Placa de identificação com display de status de aula em tempo real.`,
    iconType: 'door',
    isAccessible: true,
  });

  return steps;
};

export interface CampusEntrance {
  id: string;
  name: string;
  code: string;
  position3D: [number, number, number];
  description: string;
}

export const CAMPUS_ENTRANCES: CampusEntrance[] = [
  {
    id: 'portao-1',
    name: 'Portão 1 — Boulevard Principal & Portaria Norte',
    code: 'P1',
    position3D: [0, 0, -30],
    description: 'Entrada norte principal com portaria arquitetônica, marquise, catracas e desembarque.',
  },
  {
    id: 'portao-2',
    name: 'Portão 2 — Acesso Sul & Convivência',
    code: 'P2',
    position3D: [0, 0, 30],
    description: 'Acesso sul integrado ao Centro de Convivência e praça de eventos.',
  },
];

// Trajetos terrestres esquemáticos (waypoints 3D sobre o solo) conectando os portões aos prédios
export const CAMPUS_PATHS: CampusPath[] = [
  {
    id: 'path-bloco-a',
    name: 'Rota Boulevard até Bloco A',
    fromId: 'portao-1',
    toBuildingId: 'bloco-a',
    points3D: [
      [0, 0.08, -30],
      [0, 0.08, -6],
      [-5, 0.08, -6],
      [-9.5, 0.08, -6],
    ],
    distanceMeters: 140,
    isAccessible: true,
  },
  {
    id: 'path-bloco-b',
    name: 'Rota Boulevard até Bloco B',
    fromId: 'portao-1',
    toBuildingId: 'bloco-b',
    points3D: [
      [0, 0.08, -30],
      [0, 0.08, -6],
      [5, 0.08, -6],
      [9.5, 0.08, -6],
    ],
    distanceMeters: 145,
    isAccessible: true,
  },
  {
    id: 'path-bloco-c',
    name: 'Rota Boulevard até Bloco C',
    fromId: 'portao-1',
    toBuildingId: 'bloco-c',
    points3D: [
      [0, 0.08, -30],
      [0, 0.08, 8],
      [-5, 0.08, 8],
      [-9.5, 0.08, 8],
    ],
    distanceMeters: 165,
    isAccessible: true,
  },
  {
    id: 'path-biblioteca',
    name: 'Rota Central até Biblioteca Universitária',
    fromId: 'portao-1',
    toBuildingId: 'biblioteca',
    points3D: [
      [0, 0.08, -30],
      [0, 0.08, 8],
      [5, 0.08, 8],
      [9.5, 0.08, 8],
    ],
    distanceMeters: 165,
    isAccessible: true,
  },
  {
    id: 'path-reitoria',
    name: 'Rota Esplanada até Prédio Central e Reitoria',
    fromId: 'portao-1',
    toBuildingId: 'reitoria',
    points3D: [
      [0, 0.08, -30],
      [0, 0.08, -24],
      [0, 0.08, -13.5],
    ],
    distanceMeters: 70,
    isAccessible: true,
  },
  {
    id: 'path-convivencia',
    name: 'Rota Sul até Centro de Convivência e Alimentação',
    fromId: 'portao-2',
    toBuildingId: 'convivencia',
    points3D: [
      [0, 0.08, 30],
      [0, 0.08, 24],
      [0, 0.08, 15.5],
    ],
    distanceMeters: 60,
    isAccessible: true,
  },
];

export const getCampusPath = (buildingId: string): CampusPath | undefined => {
  return CAMPUS_PATHS.find((p) => p.toBuildingId === buildingId);
};


