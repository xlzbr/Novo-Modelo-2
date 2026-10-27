import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  ActivitySubmission,
  ScheduleEvent,
  UserPreferences,
  NotificationItem,
  AcademicNotice,
  CourseNotice,
  CourseTest,
  StudyMaterial,
  DisciplineInfo,
  ViewType,
  CampusBuilding,
  CampusRoom,
  ScheduleOverride,
  ResolvedClassSession,
} from '../types';
import {
  CAMPUS_BUILDINGS,
  CAMPUS_ROOMS,
  DEFAULT_SCHEDULE_OVERRIDES,
} from '../data/campusData';

interface EduContextType {
  tasks: Task[];
  events: ScheduleEvent[];
  notices: AcademicNotice[];
  courseNotices: CourseNotice[];
  courseTests: CourseTest[];
  materials: StudyMaterial[];
  disciplines: DisciplineInfo[];
  submissions: ActivitySubmission[];
  preferences: UserPreferences;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;
  openCoursePortal: (courseId: string) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Sistema Inteligente de Localização e Mapa do Campus
  campusBuildings: CampusBuilding[];
  campusRooms: CampusRoom[];
  scheduleOverrides: ScheduleOverride[];
  getClassesForDate: (dateStr: string) => ResolvedClassSession[];
  addScheduleOverride: (override: Omit<ScheduleOverride, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  removeScheduleOverride: (id: string) => void;
  isMapModalOpen: boolean;
  setIsMapModalOpen: (open: boolean) => void;
  targetRoomForMap?: string;
  setTargetRoomForMap: (room?: string) => void;
  targetBuildingIdForMap?: string;
  setTargetBuildingIdForMap: (id?: string) => void;
  targetDateForMap: string;
  setTargetDateForMap: (date: string) => void;
  targetSessionForMap: ResolvedClassSession | null;
  setTargetSessionForMap: (session: ResolvedClassSession | null) => void;
  openLocationGuide: (opts?: { room?: string; buildingId?: string; date?: string }) => void;
  navigateToCampusMap: (opts?: {
    buildingId?: string;
    room?: string;
    session?: ResolvedClassSession;
    date?: string;
  }) => void;


  // Entrega formal de atividades por arquivo
  submitActivity: (
    taskId: string,
    file: File,
    notes?: string
  ) => Promise<{ success: boolean; submission?: ActivitySubmission; error?: string }>;
  replaceSubmission: (
    taskId: string,
    file: File,
    notes?: string
  ) => Promise<{ success: boolean; submission?: ActivitySubmission; error?: string }>;
  getSubmissionForTask: (taskId: string) => ActivitySubmission | undefined;

  // Submissão de Testes e Avaliações
  submitTestAnswers: (
    testId: string,
    answers: Record<string, number>
  ) => Promise<{ success: boolean; score?: number; error?: string }>;

  // Agenda acadêmica
  addEvent: (data: Omit<ScheduleEvent, 'id'>) => { success: boolean; conflict?: ScheduleEvent; suggestedTime?: string };
  deleteEvent: (id: string) => void;

  // Notificações
  toggleNotificationRead: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Preferências, Perfil e Aparência
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  saveProfile: (
    newProfile: Partial<UserPreferences>
  ) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (
    prefs: Partial<UserPreferences>
  ) => Promise<{ success: boolean; error?: string }>;
  resetAllData: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  weeklyTaskGoal: 6,
  reminderLeadHours: 48,
  studentName: 'Lucas Andrade',
  studentEmail: 'lucas.andrade@folium.app',
  courseName: 'Engenharia da Computação',
  semester: '5º Semestre',
  registrationNumber: 'RA-2024-8192',
  theme: 'light',
};

// Gera datas relativas para dados acadêmicos consistentes
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Disciplinas matriculadas com dados completos de corpo docente e infraestrutura
const DEFAULT_DISCIPLINES: DisciplineInfo[] = [
  {
    id: 'disc-1',
    name: 'Programação Orientada a Objetos',
    code: 'POO',
    workload: '80 horas',
    room: 'Bloco A — 2º andar — Sala 204',
    instructor: {
      name: 'Profa. Mariana Costa',
      title: 'Doutora em Computação e Engenharia de Software (USP)',
      department: 'Departamento de Computação e Sistemas',
      office: 'Gabinete 14 — Bloco Tecnológico',
      email: 'mariana.costa@folium.app',
      officeHours: 'Segundas e Quartas das 14:00 às 16:00',
    },
    weeklySchedule: [
      { dayOfWeek: 'Segunda-feira', time: '08:00 - 10:00', room: 'Bloco A — 2º andar — Sala 204' },
      { dayOfWeek: 'Quarta-feira', time: '08:00 - 10:00', room: 'Bloco A — 2º andar — Sala 204' },
    ],
    description:
      'Paradigma orientado a objetos, encapsulamento, polimorfismo dinâmico, herança, generics, design patterns clássicos GoF e boas práticas com arquitetura limpa.',
    officialLinks: [
      { title: 'Plano de Ensino 2026.1 (PDF)', url: 'https://en.wikipedia.org/wiki/Object-oriented_programming', type: 'PDF' },
      { title: 'Repositório de Exemplos e Testes no GitHub', url: 'https://github.com', type: 'Link' },
    ],
  },
  {
    id: 'disc-2',
    name: 'Banco de Dados',
    code: 'BD',
    workload: '60 horas',
    room: 'Sala 302 — Bloco B',
    instructor: {
      name: 'Prof. Me. Carlos Eduardo',
      title: 'Mestre em Sistemas de Informação e Bancos de Dados',
      department: 'Departamento de Computação e Sistemas',
      office: 'Gabinete 22 — Bloco de Exatas',
      email: 'carlos.eduardo@folium.app',
      officeHours: 'Terças das 09:00 às 11:00',
    },
    weeklySchedule: [
      { dayOfWeek: 'Terça-feira', time: '10:00 - 12:00', room: 'Sala 302 — Bloco B' },
      { dayOfWeek: 'Quinta-feira', time: '10:00 - 12:00', room: 'Sala 302 — Bloco B' },
    ],
    description:
      'Modelagem relacional, álgebra relacional, linguagem SQL padrão ANSI, normalização até 3FN/BCNF, índices B-Tree e controle de concorrência com propriedades ACID.',
    officialLinks: [
      { title: 'Manual Oficial PostgreSQL 16', url: 'https://www.postgresql.org/docs/', type: 'Link' },
    ],
  },
  {
    id: 'disc-3',
    name: 'Estatística',
    code: 'EST',
    workload: '60 horas',
    room: 'Sala 105 — Bloco C',
    instructor: {
      name: 'Prof. Dr. André Silveira',
      title: 'Doutor em Estatística Aplicada e Modelagem Preditiva (Unicamp)',
      department: 'Departamento de Matemática e Estatística',
      office: 'Gabinete 08 — Bloco C',
      email: 'andre.silveira@folium.app',
      officeHours: 'Quartas das 14:00 às 16:00',
    },
    weeklySchedule: [
      { dayOfWeek: 'Segunda-feira', time: '14:00 - 16:00', room: 'Sala 105 — Bloco C' },
      { dayOfWeek: 'Sexta-feira', time: '10:00 - 12:00', room: 'Sala 105 — Bloco C' },
    ],
    description:
      'Variáveis aleatórias contínuas e discretas, distribuições de probabilidade (Normal, Poisson, Binomial), testes de hipóteses, regressão linear e análise bayesiana.',
    officialLinks: [
      { title: 'Caderno de Exercícios e Roteiros em R/Python', url: 'https://www.r-project.org', type: 'Link' },
    ],
  },
  {
    id: 'disc-4',
    name: 'Machine Learning',
    code: 'ML',
    workload: '60 horas',
    room: 'Laboratório 201 — Bloco B',
    instructor: {
      name: 'Profa. Dra. Juliana Ramos',
      title: 'Doutora em Inteligência Artificial e Aprendizado de Máquina (USP)',
      department: 'Departamento de Ciência da Computação',
      office: 'Gabinete 19 — Bloco B',
      email: 'juliana.ramos@folium.app',
      officeHours: 'Sextas das 14:00 às 16:00',
    },
    weeklySchedule: [
      { dayOfWeek: 'Quinta-feira', time: '14:00 - 16:00', room: 'Laboratório 201 — Bloco B' },
    ],
    description:
      'Algoritmos supervisionados e não supervisionados, redes neurais profundas, regularização, tuning de hiperparâmetros, métricas de avaliação e ética em modelos preditivos.',
    officialLinks: [
      { title: 'Documentação Scikit-Learn e PyTorch', url: 'https://scikit-learn.org', type: 'Link' },
    ],
  },
  {
    id: 'disc-5',
    name: 'Engenharia de Software',
    code: 'ES',
    workload: '80 horas',
    room: 'Sala 305 — Bloco de Tecnologia',
    instructor: {
      name: 'Prof. Dr. Roberto Fontes',
      title: 'Doutor em Engenharia de Software (UFPE)',
      department: 'Departamento de Computação e Sistemas',
      office: 'Gabinete 18 — Bloco de Tecnologia',
      email: 'roberto.fontes@folium.app',
      officeHours: 'Segundas e Sextas das 10:00 às 12:00',
    },
    weeklySchedule: [
      { dayOfWeek: 'Terça-feira', time: '14:00 - 15:40', room: 'Sala 305 — Bloco de Tecnologia' },
      { dayOfWeek: 'Quinta-feira', time: '14:00 - 15:40', room: 'Sala 305 — Bloco de Tecnologia' },
    ],
    description:
      'Ciclo de vida de software, arquiteturas monolíticas e microsserviços, padrões de projeto GoF, engenharia de requisitos, testes automatizados e integração contínua (CI/CD).',
    officialLinks: [
      { title: 'Guia do Corpo de Conhecimento em Engenharia de Software (SWEBOK)', url: 'https://www.computer.org/education/bodies-of-knowledge/swebok', type: 'Link' },
    ],
  },
];

// Tarefas curriculares publicadas pela Gestão Acadêmica
const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    courseId: 'disc-1',
    title: 'Atividade de Programação',
    discipline: 'Programação Orientada a Objetos',
    description:
      'Implementar a hierarquia de classes, herança e polimorfismo dinâmico para o sistema de gestão acadêmica.',
    instructions:
      'Entregue um arquivo compactado (.zip) contendo o código-fonte devidamente documentado ou relatório em PDF.',
    deadline: getRelativeDate(2),
    priority: 'Alta',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: 'Entregar até 23/05 - 23:59. Arquivo de código .zip ou .pdf. Tamanho máximo: 15 MB.',
    submissionType: 'Arquivo (.zip / .pdf)',
    allowedExtensions: ['.zip', '.tar.gz', '.pdf', '.docx'],
    maxSizeBytes: 15 * 1024 * 1024,
    publishedBy: 'Profa. Mariana Costa (Gestão Acadêmica)',
    allowsResubmission: true,
    supportMaterials: [
      { title: 'Template de Projeto Orientado a Objetos (PDF)', url: 'https://en.wikipedia.org/wiki/Object-oriented_programming', type: 'PDF' },
    ],
  },
  {
    id: 'task-2',
    courseId: 'disc-2',
    title: 'Estudo Dirigido',
    discipline: 'Banco de Dados',
    description:
      'Questionário prático e modelagem conceitual de banco de dados relacional com resolução de dependências funcionais.',
    instructions:
      'O documento deve conter o esquema relacional em 3FN e as queries SQL de criação das tabelas.',
    deadline: getRelativeDate(5),
    priority: 'Média',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: 'Entrega até 27/05 - 14:00. Formato PDF aceito.',
    submissionType: 'Documento PDF',
    allowedExtensions: ['.pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    publishedBy: 'Prof. Me. Carlos Eduardo (Gestão Acadêmica)',
    allowsResubmission: true,
    supportMaterials: [
      { title: 'Guia de Álgebra Relacional e SQL', url: 'https://www.postgresql.org/docs/', type: 'PDF' },
    ],
  },
  {
    id: 'task-3',
    courseId: 'disc-5',
    title: 'Reunião de Grupo',
    discipline: 'Engenharia de Software',
    description:
      'Alinhamento com a equipe de desenvolvimento sobre a arquitetura em microsserviços e divisão de sprints.',
    instructions:
      'Ata de reunião e diagrama de componentes assinado pelos integrantes.',
    deadline: getRelativeDate(0), // Hoje
    priority: 'Baixa',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Hoje - 20:00. Submissão da ata em formato PDF.',
    submissionType: 'Documento PDF',
    allowedExtensions: ['.pdf'],
    maxSizeBytes: 12 * 1024 * 1024,
    publishedBy: 'Prof. Dr. Roberto Fontes (Gestão Acadêmica)',
    allowsResubmission: true,
  },
  {
    id: 'task-4',
    courseId: 'disc-4',
    title: 'Estudo de Caso: Privacidade e Conformidade Ética em Sistemas Autônomos',
    discipline: 'Computação e Sociedade',
    description:
      'Análise crítica fundamentada nas diretrizes internacionais de governança de inteligência artificial e na LGPD.',
    instructions:
      'Texto dissertativo-argumentativo de no mínimo 3 e no máximo 6 páginas com referências bibliográficas formatadas.',
    deadline: getRelativeDate(-1), // Atrasada proposital para validação
    priority: 'Média',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: 'Submissão em formato PDF ou DOCX.',
    submissionType: 'Documento PDF / DOCX',
    allowedExtensions: ['.pdf', '.docx'],
    maxSizeBytes: 8 * 1024 * 1024,
    publishedBy: 'Profa. Dra. Beatriz Alencar (Gestão Acadêmica)',
    allowsResubmission: true,
  },
  {
    id: 'task-5',
    courseId: 'disc-5',
    title: 'Leitura Dirigida: Padrões de Projeto Arquiteturais em Microsserviços',
    discipline: 'Engenharia de Software',
    description:
      'Leitura e elaboração de síntese conceitual sobre Circuit Breaker, API Gateway e Event-Driven Architecture.',
    instructions:
      'Elabore uma síntese crítica de 2 páginas relacionando as vantagens e trade-offs de microsserviços em comparação com monólitos.',
    deadline: getRelativeDate(5),
    priority: 'Baixa',
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    notes: 'Submissão de documento em PDF.',
    submissionType: 'Documento PDF',
    allowedExtensions: ['.pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    publishedBy: 'Prof. Dr. Roberto Fontes (Gestão Acadêmica)',
    allowsResubmission: true,
  },
  {
    id: 'task-6',
    courseId: 'disc-5',
    title: 'Artigo Síntese de Arquitetura de Software',
    discipline: 'Engenharia de Software',
    description: 'Síntese das decisões arquiteturais tomadas para o sistema de exemplo do projeto semestral.',
    instructions: 'Documento com diagramas C4 e motivações das decisões de design.',
    deadline: getRelativeDate(-2),
    priority: 'Alta',
    completed: true,
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    submissionType: 'Documento PDF',
    allowedExtensions: ['.pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    publishedBy: 'Prof. Dr. Roberto Fontes (Gestão Acadêmica)',
    allowsResubmission: false,
  },
  {
    id: 'task-7',
    courseId: 'disc-2',
    title: 'Estudo Comparativo: Protocolos de Roteamento RIP vs OSPF',
    discipline: 'Redes de Computadores',
    description: 'Relatório comparativo de convergência entre protocolos vetor-distância e estado de enlace.',
    instructions: 'Submissão de relatório técnico de 3 páginas em PDF.',
    deadline: getRelativeDate(-3),
    priority: 'Média',
    completed: true,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    submissionType: 'Documento PDF',
    allowedExtensions: ['.pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    publishedBy: 'Profa. Dra. Juliana Ramos (Gestão Acadêmica)',
    allowsResubmission: false,
  },
];

// Submissões iniciais que correspondem às tarefas já concluídas
const DEFAULT_SUBMISSIONS: ActivitySubmission[] = [
  {
    id: 'sub-task-6',
    taskId: 'task-6',
    courseId: 'disc-5',
    fileName: 'Sintese_Arquitetura_Software_LucasAndrade.pdf',
    fileSize: 2480500, // ~2.4 MB
    fileType: 'application/pdf',
    submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isLate: false,
    status: 'submitted',
    submissionReceiptId: 'EDU-REC-2026-ENG-8492',
    notes: 'Versão final contendo os diagramas de contexto e contêiner.',
  },
  {
    id: 'sub-task-7',
    taskId: 'task-7',
    courseId: 'disc-2',
    fileName: 'Relatorio_Comparativo_RIP_OSPF.pdf',
    fileSize: 1845100, // ~1.8 MB
    fileType: 'application/pdf',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isLate: false,
    status: 'submitted',
    submissionReceiptId: 'EDU-REC-2026-RED-3190',
    notes: 'Gráficos de tempo de convergência gerados no Cisco Packet Tracer.',
  },
];

// Notícias e comunicados específicos por curso
const DEFAULT_COURSE_NOTICES: CourseNotice[] = [
  {
    id: 'cnot-1',
    courseId: 'disc-1',
    discipline: 'Algoritmos e Estruturas de Dados',
    title: 'Orientações para o Trabalho Prático de Grafos e Dijkstra',
    message:
      'Atenção discentes: a submissão da Lista 03 deve conter o código-fonte devidamente comentado com os testes de estresse em grafos densos. O relatório deve explicitar a análise de complexidade das rotações e do relaxamento de arestas.',
    author: 'Prof. Dr. Marcos Silveira',
    publishedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    priority: 'Importante',
    attachments: [{ title: 'Rubrica de Avaliação de Grafos (PDF)', url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm' }],
  },
  {
    id: 'cnot-2',
    courseId: 'disc-2',
    discipline: 'Redes de Computadores',
    title: 'Arquivos PCAP Disponíveis para o Relatório de TCP/IP',
    message:
      'Os arquivos de captura contendo os traces de tráfego TCP Reno e Cubic sob latência controlada já estão disponíveis para download na aba de Materiais do curso. Usem a versão mais recente do Wireshark.',
    author: 'Profa. Dra. Juliana Ramos',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    priority: 'Informativo',
  },
  {
    id: 'cnot-3',
    courseId: 'disc-3',
    discipline: 'Sistemas de Banco de Dados',
    title: 'Plantão de Dúvidas sobre Normalização (1FN a 3FN)',
    message:
      'Haverá sessão de monitoria e atendimento para tirar dúvidas de decomposição sem perda de junção nesta quinta-feira das 14h às 16h no laboratório 202.',
    author: 'Prof. Me. Carlos Eduardo',
    publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    priority: 'Informativo',
  },
  {
    id: 'cnot-4',
    courseId: 'disc-4',
    discipline: 'Computação e Sociedade',
    title: 'Prorrogação do Prazo do Estudo de Caso de Ética em IA',
    message:
      'Em razão do evento acadêmico desta semana, o prazo do estudo de caso foi estendido para envio com validação de atraso no portal.',
    author: 'Profa. Dra. Beatriz Alencar',
    publishedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    priority: 'Importante',
  },
  {
    id: 'cnot-5',
    courseId: 'disc-5',
    discipline: 'Engenharia de Software',
    title: 'Apresentação Intermediária dos Projetos de Arquitetura',
    message:
      'Cada grupo terá 10 minutos para apresentar a motivação das escolhas arquiteturais no dia 15. A ordem de apresentação seguirá a ordem alfabética das equipes.',
    author: 'Prof. Dr. Roberto Fontes',
    publishedAt: new Date(Date.now() - 86400000 * 2.5).toISOString(),
    priority: 'Importante',
  },
];

// Testes e avaliações por disciplina
const DEFAULT_COURSE_TESTS: CourseTest[] = [
  {
    id: 'test-1',
    courseId: 'disc-1',
    discipline: 'Algoritmos e Estruturas de Dados',
    title: 'Avaliação Objetiva: Complexidade Assintótica e Árvores AVL',
    description:
      'Avaliação conceitual objetiva sobre cálculo de altura, fatores de balanceamento e complexidade assintótica.',
    instructions:
      'Este teste contém 3 questões de múltipla escolha. Você terá 45 minutos. As respostas são gravadas e confirmadas antes do encerramento final.',
    deadline: getRelativeDate(4),
    durationMinutes: 45,
    totalQuestions: 3,
    status: 'Pendente',
    questions: [
      {
        id: 'q1-1',
        question: 'Qual é a complexidade assintótica no pior caso para a busca de uma chave em uma Árvore AVL contendo N nós?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctIndex: 1,
      },
      {
        id: 'q1-2',
        question: 'Em uma Árvore AVL, quando um nó apresenta fator de balanceamento FB = +2 e seu filho à esquerda possui FB = -1, qual operação deve ser executada?',
        options: [
          'Rotação Simples à Direita',
          'Rotação Simples à Esquerda',
          'Rotação Dupla Direita (Esquerda depois Direita)',
          'Nenhuma rotação é necessária',
        ],
        correctIndex: 2,
      },
      {
        id: 'q1-3',
        question: 'Qual é a premissa obrigatória para a aplicação do Algoritmo de Dijkstra para encontrar caminhos mínimos?',
        options: [
          'O grafo deve ser estritamente acíclico',
          'Todas as arestas devem ter pesos não-negativos',
          'O grafo deve ter no máximo 100 vértices',
          'O grafo deve ser não-direcionado',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'test-2',
    courseId: 'disc-2',
    discipline: 'Redes de Computadores',
    title: 'Questionário Diagnóstico: Protocolos TCP e IPv4',
    description:
      'Teste rápido de verificação sobre o handshake de 3 vias e fragmentação de pacotes na camada de rede.',
    instructions:
      'Responda às questões e confirme a submissão das respostas para obter o registro formal de participação.',
    deadline: getRelativeDate(2),
    durationMinutes: 30,
    totalQuestions: 2,
    status: 'Pendente',
    questions: [
      {
        id: 'q2-1',
        question: 'Qual é a sequência exata de pacotes trocada entre cliente e servidor no Three-Way Handshake do TCP?',
        options: ['SYN -> SYN+ACK -> ACK', 'ACK -> SYN -> FIN', 'SYN -> ACK -> RST', 'FIN -> ACK -> SYN'],
        correctIndex: 0,
      },
      {
        id: 'q2-2',
        question: 'Qual campo do cabeçalho IPv4 é decrementado em cada roteador para impedir que pacotes circulem indefinidamente em caso de loops?',
        options: ['Checksum', 'TTL (Time to Live)', 'Protocol ID', 'IHL'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'test-3',
    courseId: 'disc-3',
    discipline: 'Sistemas de Banco de Dados',
    title: 'Avaliação Prática: Dependências Funcionais e 3FN',
    description:
      'Questionário avaliativo com verificação de formas normais e eliminação de anomalias de atualização.',
    instructions:
      'Teste previamente realizado e arquivado com confirmação de envio no sistema.',
    deadline: getRelativeDate(-3),
    durationMinutes: 40,
    totalQuestions: 2,
    status: 'Realizado',
    submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    score: 9.5,
    userAnswers: { 'q3-1': 1, 'q3-2': 0 },
    questions: [
      {
        id: 'q3-1',
        question: 'Uma relação está na Terceira Forma Normal (3FN) se estiver na 2FN e adicionalmente:',
        options: [
          'Todos os atributos forem atômicos',
          'Nenhum atributo não-chave depender transitivamente da chave primária',
          'Não houver chaves estrangeiras declaradas',
          'Todos os dados estiverem desnormalizados',
        ],
        correctIndex: 1,
      },
      {
        id: 'q3-2',
        question: 'O que caracteriza a propriedade de Atomicidade em transações ACID em um SGBD relacional?',
        options: [
          'A transação é executada por completo ou todas as suas operações são desfeitas (tudo ou nada)',
          'As transações não interferem entre si mesmo concorrentemente',
          'Os dados são gravados permanentemente em disco ótico',
          'O banco de dados não aceita consultas de leitura',
        ],
        correctIndex: 0,
      },
    ],
  },
];

// Materiais de Estudo
const DEFAULT_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    courseId: 'disc-1',
    title: 'Apostila Oficial: Estruturas de Dados e Algoritmos em Grafos',
    discipline: 'Algoritmos e Estruturas de Dados',
    type: 'PDF',
    url: 'https://en.wikipedia.org/wiki/Binary_search_tree',
    dateAdded: getRelativeDate(-8),
    description: 'Notas de aula completas cobrindo complexidade assintótica, árvores AVL e busca em largura/profundidade.',
    fileSize: '3.2 MB',
  },
  {
    id: 'mat-2',
    courseId: 'disc-2',
    title: 'Guia de Laboratório: Captura e Inspeção de Pacotes Wireshark',
    discipline: 'Redes de Computadores',
    type: 'PDF',
    url: 'https://www.wireshark.org/docs/',
    dateAdded: getRelativeDate(-5),
    description: 'Roteiro de aula prática para filtros de exibição, handshake de 3 vias do TCP e análise de fluxo DNS.',
    fileSize: '2.1 MB',
  },
  {
    id: 'mat-3',
    courseId: 'disc-3',
    title: 'Slides de Aula: Álgebra Relacional e Formas Normais (1FN a 3FN)',
    discipline: 'Sistemas de Banco de Dados',
    type: 'Slide',
    url: 'https://www.w3schools.com/sql/',
    dateAdded: getRelativeDate(-3),
    description: 'Apresentação em slides com exemplos práticos de desnormalização e decomposição sem perda de junção.',
    fileSize: '4.5 MB',
  },
  {
    id: 'mat-4',
    courseId: 'disc-5',
    title: 'Referência Arquitetural: Padrões de Projeto para Microsserviços',
    discipline: 'Engenharia de Software',
    type: 'Link',
    url: 'https://martinfowler.com/articles/microservices.html',
    dateAdded: getRelativeDate(-2),
    description: 'Artigo clássico de Martin Fowler explorando conceitos fundamentais de desacoplamento e governança descentralizada.',
    fileSize: 'Web Link',
  },
  {
    id: 'mat-5',
    courseId: 'disc-4',
    title: 'Código de Ética Profissional e Conduta ACM / IEEE-CS',
    discipline: 'Computação e Sociedade',
    type: 'PDF',
    url: 'https://www.acm.org/code-of-ethics',
    dateAdded: getRelativeDate(-10),
    description: 'Documento normativo sobre responsabilidade social, integridade técnica e transparência em sistemas computacionais.',
    fileSize: '1.4 MB',
  },
];

// Eventos e aulas da agenda acadêmica
// Eventos e aulas da agenda acadêmica Folium
const DEFAULT_EVENTS: ScheduleEvent[] = [
  {
    id: 'evt-1',
    taskId: 'task-1',
    title: 'Programação Orientada a Objetos',
    discipline: 'Programação Orientada a Objetos',
    date: getRelativeDate(0), // Hoje
    startTime: '08:00',
    durationMinutes: 120,
    location: 'Bloco A – 2º andar – Sala 204',
    notes: 'Aula inaugural de modelagem orientada a objetos e diagramação UML.',
    type: 'aula',
  },
  {
    id: 'evt-2',
    taskId: 'task-2',
    title: 'Banco de Dados',
    discipline: 'Banco de Dados',
    date: getRelativeDate(0), // Hoje
    startTime: '10:00',
    durationMinutes: 120,
    location: 'Sala 302 – Bloco B',
    notes: 'Laboratório prático de DDL/DML em PostgreSQL.',
    type: 'aula',
  },
  {
    id: 'evt-3',
    title: 'Estatística',
    discipline: 'Estatística',
    date: getRelativeDate(0), // Hoje
    startTime: '14:00',
    durationMinutes: 120,
    location: 'Sala 105 – Bloco C',
    notes: 'Variáveis aleatórias e análise exploratória de dados.',
    type: 'aula',
  },
  {
    id: 'evt-4',
    title: 'Estudo Dirigido',
    discipline: 'Programação Orientada a Objetos',
    date: getRelativeDate(0), // Hoje
    startTime: '19:00',
    durationMinutes: 120,
    location: 'Biblioteca Universitária',
    notes: 'Resolução colaborativa de exercícios e dúvidas.',
    type: 'estudo',
  },
  {
    id: 'evt-5',
    taskId: 'task-3',
    title: 'Revisão Arquitetural: Microsserviços e Padrões GoF',
    discipline: 'Engenharia de Software',
    date: getRelativeDate(1), // Amanhã
    startTime: '15:00',
    durationMinutes: 90,
    location: 'Sala 305 — Bloco de Tecnologia',
    type: 'revisao',
  },
];

const DEFAULT_NOTICES: AcademicNotice[] = [
  {
    id: 'notice-1',
    title: 'Mudança de sala – Introdução à Programação',
    message: 'Aula de hoje será no Bloco A, sala 204.',
    discipline: 'Programação Orientada a Objetos',
    date: getRelativeDate(0),
    priority: 'Alta',
    author: 'Coordenação de Curso Folium',
  },
  {
    id: 'notice-2',
    title: 'Novo material disponível',
    message: 'Foi disponibilizado o material da semana 5.',
    discipline: 'Banco de Dados',
    date: getRelativeDate(-1),
    priority: 'Média',
    author: 'Prof. Me. Carlos Eduardo',
  },
  {
    id: 'notice-3',
    title: 'Prazo de atividade atualizado',
    message: 'O prazo da atividade de Banco de Dados foi alterado.',
    discipline: 'Banco de Dados',
    date: getRelativeDate(-2),
    priority: 'Média',
    author: 'Colegiado de Curso',
  },
];

const EduContext = createContext<EduContextType | undefined>(undefined);

export const EduProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Submissões reais de arquivos persistidas (compatibilidade Folium + EduConnect)
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>(() => {
    try {
      const stored = localStorage.getItem('folium_submissions_v1') || localStorage.getItem('educonnect_submissions_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return DEFAULT_SUBMISSIONS;
  });

  // Tarefas da gestão (o estado completed é estritamente derivado das submissões registradas)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('folium_tasks_v1') || localStorage.getItem('educonnect_tasks_v3');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return DEFAULT_TASKS;
  });

  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const stored = localStorage.getItem('folium_events_v1') || localStorage.getItem('educonnect_events_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return DEFAULT_EVENTS;
  });

  const [notices] = useState<AcademicNotice[]>(DEFAULT_NOTICES);
  const [courseNotices] = useState<CourseNotice[]>(DEFAULT_COURSE_NOTICES);

  const [courseTests, setCourseTests] = useState<CourseTest[]>(() => {
    try {
      const stored = localStorage.getItem('folium_course_tests_v1') || localStorage.getItem('educonnect_course_tests_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return DEFAULT_COURSE_TESTS;
  });

  const [materials] = useState<StudyMaterial[]>(DEFAULT_MATERIALS);
  const [disciplines] = useState<DisciplineInfo[]>(DEFAULT_DISCIPLINES);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('folium_prefs_v1') || localStorage.getItem('educonnect_prefs_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch {
      // Ignora erro
    }
    return DEFAULT_PREFERENCES;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('folium_theme_v1');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      const storedPrefs = localStorage.getItem('folium_prefs_v1') || localStorage.getItem('educonnect_prefs_v2');
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        if (parsed.theme === 'light' || parsed.theme === 'dark') {
          return parsed.theme;
        }
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Ignora erro
    }
    return 'light';
  });

  // Sincroniza a classe 'dark' no documento raiz
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        localStorage.setItem('folium_theme_v1', theme);
      } catch {
        // Ignora
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme: 'light' | 'dark' = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('folium_theme_v1', nextTheme);
      } catch {
        // Ignora
      }
      setPreferences((p) => {
        const updated = { ...p, theme: nextTheme };
        try {
          localStorage.setItem('folium_prefs_v1', JSON.stringify(updated));
          localStorage.setItem('educonnect_prefs_v2', JSON.stringify(updated));
        } catch {
          // Ignora
        }
        return updated;
      });
      return nextTheme;
    });
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('folium_theme_v1', newTheme);
    } catch {
      // Ignora
    }
    setPreferences((p) => {
      const updated = { ...p, theme: newTheme };
      try {
        localStorage.setItem('folium_prefs_v1', JSON.stringify(updated));
        localStorage.setItem('educonnect_prefs_v2', JSON.stringify(updated));
      } catch {
        // Ignora
      }
      return updated;
    });
  }, []);

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('folium_read_notifs_v1') || localStorage.getItem('educonnect_read_notifs_v2');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return [];
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados do Sistema Inteligente de Localização e Mapa 3D
  const [campusBuildings] = useState<CampusBuilding[]>(CAMPUS_BUILDINGS);
  const [campusRooms] = useState<CampusRoom[]>(CAMPUS_ROOMS);
  const [scheduleOverrides, setScheduleOverrides] = useState<ScheduleOverride[]>(() => {
    try {
      const stored = localStorage.getItem('folium_schedule_overrides_v1');
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignora erro
    }
    return DEFAULT_SCHEDULE_OVERRIDES;
  });

  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [targetRoomForMap, setTargetRoomForMap] = useState<string | undefined>(undefined);
  const [targetBuildingIdForMap, setTargetBuildingIdForMap] = useState<string | undefined>(undefined);
  const [targetDateForMap, setTargetDateForMap] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [targetSessionForMap, setTargetSessionForMap] = useState<ResolvedClassSession | null>(null);

  // Sincroniza alterações excepcionais de sala no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('folium_schedule_overrides_v1', JSON.stringify(scheduleOverrides));
    } catch (err) {
      console.warn('Falha ao persistir alterações excepcionais:', err);
    }
  }, [scheduleOverrides]);

  // Abre guia de localização e mapa focado no destino solicitado
  const openLocationGuide = useCallback((opts?: { room?: string; buildingId?: string; date?: string }) => {
    if (opts?.date) setTargetDateForMap(opts.date);
    if (opts?.room) setTargetRoomForMap(opts.room);
    if (opts?.buildingId) setTargetBuildingIdForMap(opts.buildingId);
    setIsMapModalOpen(true);
  }, []);

  // Navega para a página dedicada do Mapa 3D do Campus
  const navigateToCampusMap = useCallback(
    (opts?: {
      buildingId?: string;
      room?: string;
      session?: ResolvedClassSession;
      date?: string;
    }) => {
      if (opts?.date) setTargetDateForMap(opts.date);
      if (opts?.buildingId) setTargetBuildingIdForMap(opts.buildingId);
      if (opts?.room) setTargetRoomForMap(opts.room);
      if (opts?.session !== undefined) setTargetSessionForMap(opts.session);
      setActiveView('campus-map');
    },
    []
  );

  // Sincroniza persistência de submissões
  useEffect(() => {
    try {
      const data = JSON.stringify(submissions);
      localStorage.setItem('folium_submissions_v1', data);
      localStorage.setItem('educonnect_submissions_v2', data);
    } catch (err) {
      console.warn('Falha ao persistir submissões:', err);
    }
  }, [submissions]);

  // Sincroniza estado de conclusão das tarefas com as submissões reais registradas
  useEffect(() => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        const sub = submissions.find((s) => s.taskId === t.id);
        if (sub) {
          return {
            ...t,
            completed: true,
            completedAt: sub.submittedAt,
          };
        }
        return {
          ...t,
          completed: false,
          completedAt: undefined,
        };
      })
    );
  }, [submissions]);

  // Sincroniza tarefas no localStorage
  useEffect(() => {
    try {
      const data = JSON.stringify(tasks);
      localStorage.setItem('folium_tasks_v1', data);
      localStorage.setItem('educonnect_tasks_v3', data);
    } catch (err) {
      console.warn('Falha ao persistir tarefas:', err);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      const data = JSON.stringify(events);
      localStorage.setItem('folium_events_v1', data);
      localStorage.setItem('educonnect_events_v2', data);
    } catch (err) {
      console.warn('Falha ao persistir agenda:', err);
    }
  }, [events]);

  useEffect(() => {
    try {
      const data = JSON.stringify(courseTests);
      localStorage.setItem('folium_course_tests_v1', data);
      localStorage.setItem('educonnect_course_tests_v2', data);
    } catch (err) {
      console.warn('Falha ao persistir testes de curso:', err);
    }
  }, [courseTests]);

  useEffect(() => {
    try {
      const data = JSON.stringify(preferences);
      localStorage.setItem('folium_prefs_v1', data);
      localStorage.setItem('educonnect_prefs_v2', data);
    } catch (err) {
      console.warn('Falha ao persistir preferências:', err);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      const data = JSON.stringify(readNotificationIds);
      localStorage.setItem('folium_read_notifs_v1', data);
      localStorage.setItem('educonnect_read_notifs_v2', data);
    } catch (err) {
      console.warn('Falha ao persistir leitura de notificações:', err);
    }
  }, [readNotificationIds]);

  // Navega diretamente para o portal de um curso específico
  const openCoursePortal = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveView('disciplines');
  }, []);

  // Busca submissão de uma tarefa específica
  const getSubmissionForTask = useCallback(
    (taskId: string): ActivitySubmission | undefined => {
      return submissions.find((s) => s.taskId === taskId);
    },
    [submissions]
  );

  // Entrega formal de atividade acadêmica por envio de arquivo
  const submitActivity = useCallback(
    async (
      taskId: string,
      file: File,
      notes?: string
    ): Promise<{ success: boolean; submission?: ActivitySubmission; error?: string }> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        return { success: false, error: 'Atividade não encontrada no sistema acadêmico.' };
      }

      // Validação de tipo de arquivo
      const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const allowedExts = task.allowedExtensions || ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.zip', '.tar.gz'];
      const isExtValid = allowedExts.some((ext) => ext.toLowerCase() === fileExt);

      if (!isExtValid) {
        return {
          success: false,
          error: `Formato de arquivo inválido (${fileExt}). Formatos aceitos para esta atividade: ${allowedExts.join(', ')}`,
        };
      }

      // Validação de tamanho
      const maxBytes = task.maxSizeBytes || 15 * 1024 * 1024;
      if (file.size > maxBytes) {
        const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
        const fileMb = (file.size / (1024 * 1024)).toFixed(1);
        return {
          success: false,
          error: `O arquivo selecionado (${fileMb} MB) excede o limite máximo permitido de ${maxMb} MB.`,
        };
      }

      // Simulação assíncrona do upload com checagem de integridade (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const isLate = !!(task.deadline && task.deadline < todayStr);

      const receiptId = `FOLIUM-SUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const newSubmission: ActivitySubmission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        taskId: task.id,
        courseId: task.courseId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        submittedAt: now.toISOString(),
        isLate,
        status: isLate ? 'late' : 'submitted',
        notes: notes?.trim() || undefined,
        submissionReceiptId: receiptId,
      };

      setSubmissions((prev) => {
        const filtered = prev.filter((s) => s.taskId !== taskId);
        return [...filtered, newSubmission];
      });

      return { success: true, submission: newSubmission };
    },
    [tasks]
  );

  // Substituição de arquivo em atividade já entregue (preserva histórico de envio)
  const replaceSubmission = useCallback(
    async (
      taskId: string,
      file: File,
      notes?: string
    ): Promise<{ success: boolean; submission?: ActivitySubmission; error?: string }> => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        return { success: false, error: 'Atividade acadêmica não localizada.' };
      }

      if (task.allowsResubmission === false) {
        return {
          success: false,
          error: 'Esta atividade não autoriza reenvio ou substituição de arquivo após a entrega.',
        };
      }

      const existingSub = submissions.find((s) => s.taskId === taskId);

      // Validação de tipo de arquivo
      const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const allowedExts = task.allowedExtensions || ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.zip', '.tar.gz'];
      const isExtValid = allowedExts.some((ext) => ext.toLowerCase() === fileExt);

      if (!isExtValid) {
        return {
          success: false,
          error: `Formato de arquivo inválido (${fileExt}). Formatos aceitos: ${allowedExts.join(', ')}`,
        };
      }

      const maxBytes = task.maxSizeBytes || 15 * 1024 * 1024;
      if (file.size > maxBytes) {
        const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
        return {
          success: false,
          error: `O arquivo excede o limite máximo permitido de ${maxMb} MB.`,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const isLate = !!(task.deadline && task.deadline < todayStr);

      const receiptId = `FOLIUM-SUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const historyEntry = existingSub
        ? [
            ...(existingSub.history || []),
            {
              fileName: existingSub.fileName,
              submittedAt: existingSub.submittedAt,
              isLate: existingSub.isLate,
              fileSize: existingSub.fileSize,
            },
          ]
        : [];

      const updatedSub: ActivitySubmission = {
        id: existingSub?.id || `sub-${Date.now()}`,
        taskId: task.id,
        courseId: task.courseId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        submittedAt: now.toISOString(),
        isLate,
        status: isLate ? 'late' : 'submitted',
        notes: notes?.trim() || existingSub?.notes,
        submissionReceiptId: receiptId,
        history: historyEntry,
      };

      setSubmissions((prev) => {
        const remaining = prev.filter((s) => s.taskId !== taskId);
        return [...remaining, updatedSub];
      });

      return { success: true, submission: updatedSub };
    },
    [tasks, submissions]
  );

  // Submissão de Testes e Avaliações Online
  const submitTestAnswers = useCallback(
    async (
      testId: string,
      answers: Record<string, number>
    ): Promise<{ success: boolean; score?: number; error?: string }> => {
      const test = courseTests.find((t) => t.id === testId);
      if (!test) {
        return { success: false, error: 'Avaliação não encontrada.' };
      }

      if (Object.keys(answers).length < test.totalQuestions) {
        return {
          success: false,
          error: 'Por favor, responda a todas as questões antes de confirmar a submissão.',
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Cálculo de acertos
      let correctCount = 0;
      test.questions.forEach((q) => {
        if (q.correctIndex !== undefined && answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const score = Number(((correctCount / test.totalQuestions) * 10).toFixed(1));

      setCourseTests((prev) =>
        prev.map((t) => {
          if (t.id === testId) {
            return {
              ...t,
              status: 'Realizado',
              submittedAt: new Date().toISOString(),
              score,
              userAnswers: answers,
            };
          }
          return t;
        })
      );

      return { success: true, score };
    },
    [courseTests]
  );

  // Helper de cálculo de horários em minutos
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Ações da Agenda com Detecção de Conflito
  const addEvent = useCallback(
    (data: Omit<ScheduleEvent, 'id'>) => {
      const newStart = timeToMinutes(data.startTime);
      const newEnd = newStart + data.durationMinutes;

      const conflict = events.find((evt) => {
        if (evt.date !== data.date) return false;
        const existStart = timeToMinutes(evt.startTime);
        const existEnd = existStart + evt.durationMinutes;
        return newStart < existEnd && newEnd > existStart;
      });

      if (conflict) {
        const conflictEnd = timeToMinutes(conflict.startTime) + conflict.durationMinutes;
        const suggestedMins = conflictEnd + 15;
        const suggestedTime = suggestedMins < 1440 ? minutesToTime(suggestedMins) : '08:00';

        return {
          success: false,
          conflict,
          suggestedTime,
        };
      }

      const newEvent: ScheduleEvent = {
        ...data,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };

      setEvents((prev) => [...prev, newEvent]);
      return { success: true };
    },
    [events]
  );

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Notificações Determinísticas
  const notifications = useMemo(() => {
    const list: NotificationItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const leadMs = preferences.reminderLeadHours * 60 * 60 * 1000;

    tasks.forEach((t) => {
      if (t.completed) return; // Tarefas entregues não geram alerta de pendência

      if (t.deadline) {
        if (t.deadline < todayStr) {
          list.push({
            id: `notif-overdue-${t.id}`,
            taskId: t.id,
            title: `Prazo Expirado: ${t.discipline}`,
            message: `A atividade "${t.title}" está com prazo expirado desde ${t.deadline}. Realize a entrega com atraso para registro.`,
            type: 'overdue',
            date: t.deadline,
            read: readNotificationIds.includes(`notif-overdue-${t.id}`),
          });
        } else {
          const taskDate = new Date(`${t.deadline}T23:59:59`);
          const diffMs = taskDate.getTime() - now.getTime();
          if (diffMs > 0 && diffMs <= leadMs) {
            list.push({
              id: `notif-due-${t.id}`,
              taskId: t.id,
              title: `Prazo Próximo: ${t.discipline}`,
              message: `A atividade "${t.title}" vence em breve (${t.deadline}). Prepare o arquivo para submissão.`,
              type: 'due_soon',
              date: t.deadline,
              read: readNotificationIds.includes(`notif-due-${t.id}`),
            });
          }
        }
      }
    });

    // Comunicados importantes dos cursos
    courseNotices
      .filter((cn) => cn.priority === 'Importante')
      .forEach((cn) => {
        list.push({
          id: `notif-cnot-${cn.id}`,
          noticeId: cn.id,
          title: `Aviso Importante: ${cn.discipline}`,
          message: cn.message,
          type: 'announcement',
          date: cn.publishedAt.split('T')[0],
          read: readNotificationIds.includes(`notif-cnot-${cn.id}`),
        });
      });

    return list;
  }, [tasks, preferences.reminderLeadHours, readNotificationIds, courseNotices]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const toggleNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds(allIds);
  }, [notifications]);

  const saveProfile = useCallback(
    async (
      newProfile: Partial<UserPreferences>
    ): Promise<{ success: boolean; error?: string }> => {
      // 1. Validação obrigatória dos campos de perfil
      if (newProfile.studentName !== undefined && !newProfile.studentName.trim()) {
        return { success: false, error: 'O nome do estudante não pode ficar em branco.' };
      }
      if (newProfile.studentEmail !== undefined) {
        const emailTrimmed = newProfile.studentEmail.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
          return { success: false, error: 'Informe um endereço de e-mail válido (ex: nome@instituicao.br).' };
        }
      }
      if (newProfile.courseName !== undefined && !newProfile.courseName.trim()) {
        return { success: false, error: 'O curso de graduação não pode ficar em branco.' };
      }
      if (newProfile.semester !== undefined && !newProfile.semester.trim()) {
        return { success: false, error: 'O semestre ou período letivo não pode ficar em branco.' };
      }
      if (newProfile.registrationNumber !== undefined && !newProfile.registrationNumber.trim()) {
        return { success: false, error: 'O número de matrícula não pode ficar em branco.' };
      }

      // Pequena pausa (350ms) para feedback visual do ciclo de salvamento ("Salvando...")
      await new Promise((resolve) => setTimeout(resolve, 350));

      try {
        const updated: UserPreferences = {
          ...preferences,
          ...newProfile,
          studentName: newProfile.studentName !== undefined ? newProfile.studentName.trim() : preferences.studentName,
          studentEmail: newProfile.studentEmail !== undefined ? newProfile.studentEmail.trim() : preferences.studentEmail,
          courseName: newProfile.courseName !== undefined ? newProfile.courseName.trim() : preferences.courseName,
          semester: newProfile.semester !== undefined ? newProfile.semester.trim() : preferences.semester,
          registrationNumber: newProfile.registrationNumber !== undefined ? newProfile.registrationNumber.trim() : preferences.registrationNumber,
        };

        // Gravação direta com verificação de integridade no localStorage
        const serialized = JSON.stringify(updated);
        localStorage.setItem('educonnect_prefs_v2', serialized);

        const readBack = localStorage.getItem('educonnect_prefs_v2');
        if (readBack !== serialized) {
          throw new Error('Falha na validação de persistência do armazenamento local.');
        }

        // Atualiza estado compartilhado do React (Header, ProfileView, SettingsView)
        setPreferences(updated);

        return { success: true };
      } catch (err: any) {
        console.error('Erro ao persistir preferências do perfil:', err);
        return {
          success: false,
          error:
            err?.message ||
            'Não foi possível salvar as alterações no armazenamento local do navegador.',
        };
      }
    },
    [preferences]
  );

  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>): Promise<{ success: boolean; error?: string }> => {
      return saveProfile(prefs);
    },
    [saveProfile]
  );

  const getClassesForDate = useCallback(
    (dateStr: string): ResolvedClassSession[] => {
      if (!dateStr) return [];
      const parts = dateStr.split('-');
      if (parts.length !== 3) return [];
      const [y, m, d] = parts.map(Number);
      const targetDate = new Date(y, m - 1, d, 12, 0, 0);
      const dayOfWeekNum = targetDate.getDay();

      const weekDaysMap: Record<number, string> = {
        0: 'Domingo',
        1: 'Segunda-feira',
        2: 'Terça-feira',
        3: 'Quarta-feira',
        4: 'Quinta-feira',
        5: 'Sexta-feira',
        6: 'Sábado',
      };
      const dayName = weekDaysMap[dayOfWeekNum] || 'Segunda-feira';

      const results: ResolvedClassSession[] = [];

      disciplines.forEach((disc) => {
        disc.weeklySchedule.forEach((sched) => {
          const schedDay = sched.dayOfWeek.toLowerCase().trim();
          const targetDay = dayName.toLowerCase().trim();

          const matchesDay =
            schedDay.includes(targetDay) ||
            targetDay.includes(schedDay) ||
            (dayOfWeekNum === 1 && schedDay.startsWith('seg')) ||
            (dayOfWeekNum === 2 && schedDay.startsWith('ter')) ||
            (dayOfWeekNum === 3 && schedDay.startsWith('qua')) ||
            (dayOfWeekNum === 4 && schedDay.startsWith('qui')) ||
            (dayOfWeekNum === 5 && schedDay.startsWith('sex')) ||
            (dayOfWeekNum === 6 && schedDay.startsWith('sáb'));

          if (matchesDay) {
            const timeParts = sched.time.split('-').map((s) => s.trim());
            const startTime = timeParts[0] || '08:00';
            const endTime = timeParts[1] || '10:00';

            const override = scheduleOverrides.find(
              (o) =>
                o.date === dateStr &&
                (o.disciplineId === disc.id ||
                  o.disciplineName.toLowerCase().trim() === disc.name.toLowerCase().trim())
            );

            let buildingId = 'bloco-a';
            let buildingName = 'Bloco A — Ciências da Computação';
            let buildingCode = 'BL-A';
            let room = sched.room || disc.room || 'Sala 204 — Bloco A';
            let floor = '2º Pavimento';
            let gate = 'Portão 1 (Boulevard)';
            let isOverride = false;
            let overrideReason: string | undefined;
            let overrideAuthor: string | undefined;

            if (override) {
              isOverride = true;
              buildingId = override.newBuildingId;
              room = override.newRoom;
              overrideReason = override.reason;
              overrideAuthor = override.createdBy;

              const bMatch = campusBuildings.find((b) => b.id === override.newBuildingId);
              if (bMatch) {
                buildingName = bMatch.name;
                buildingCode = bMatch.code;
                gate = bMatch.gate;
              }
            } else {
              const defaultRoom = sched.room || disc.room || '';
              if (defaultRoom.toLowerCase().includes('bloco b')) {
                buildingId = 'bloco-b';
              } else if (defaultRoom.toLowerCase().includes('bloco c')) {
                buildingId = 'bloco-c';
              } else if (defaultRoom.toLowerCase().includes('biblioteca')) {
                buildingId = 'biblioteca';
              } else if (defaultRoom.toLowerCase().includes('bloco a')) {
                buildingId = 'bloco-a';
              }
              const bMatch = campusBuildings.find((b) => b.id === buildingId);
              if (bMatch) {
                buildingName = bMatch.name;
                buildingCode = bMatch.code;
                gate = bMatch.gate;
              }
            }

            if (room.toLowerCase().includes('3º') || room.toLowerCase().includes('302') || room.toLowerCase().includes('305')) {
              floor = '3º Pavimento (Andar 3)';
            } else if (room.toLowerCase().includes('2º') || room.toLowerCase().includes('204') || room.toLowerCase().includes('201')) {
              floor = '2º Pavimento (Andar 2)';
            } else if (room.toLowerCase().includes('1º') || room.toLowerCase().includes('105') || room.toLowerCase().includes('102') || room.toLowerCase().includes('101')) {
              floor = '1º Pavimento (Andar 1)';
            } else if (room.toLowerCase().includes('térreo')) {
              floor = 'Térreo';
            }

            results.push({
              id: `class-${disc.id}-${sched.time}-${dateStr}`,
              disciplineId: disc.id,
              disciplineName: disc.name,
              code: disc.code,
              instructor: disc.instructor?.name || 'Corpo Docente Folium',
              date: dateStr,
              time: sched.time,
              startTime,
              endTime,
              buildingId,
              buildingName,
              buildingCode,
              room,
              floor,
              gate,
              turma: 'Turma A — Engenharia da Computação',
              isOverride,
              overrideReason,
              overrideAuthor,
            });
          }
        });
      });

      return results.sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    [disciplines, scheduleOverrides, campusBuildings]
  );

  const addScheduleOverride = useCallback(
    (override: Omit<ScheduleOverride, 'id' | 'createdAt'>) => {
      const newOverride: ScheduleOverride = {
        ...override,
        id: `override-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setScheduleOverrides((prev) => {
        const filtered = prev.filter(
          (o) => !(o.date === override.date && o.disciplineId === override.disciplineId)
        );
        return [newOverride, ...filtered];
      });
      return { success: true };
    },
    []
  );

  const removeScheduleOverride = useCallback((id: string) => {
    setScheduleOverrides((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const resetAllData = useCallback(() => {
    setTasks(DEFAULT_TASKS);
    setEvents(DEFAULT_EVENTS);
    setSubmissions(DEFAULT_SUBMISSIONS);
    setCourseTests(DEFAULT_COURSE_TESTS);
    setPreferences(DEFAULT_PREFERENCES);
    setScheduleOverrides(DEFAULT_SCHEDULE_OVERRIDES);
    setReadNotificationIds([]);
    try {
      localStorage.removeItem('educonnect_tasks_v3');
      localStorage.removeItem('educonnect_events_v2');
      localStorage.removeItem('educonnect_submissions_v2');
      localStorage.removeItem('educonnect_course_tests_v2');
      localStorage.removeItem('educonnect_prefs_v2');
      localStorage.removeItem('educonnect_read_notifs_v2');
      localStorage.removeItem('folium_schedule_overrides_v1');
    } catch {
      // Ignora erro
    }
  }, []);

  return (
    <EduContext.Provider
      value={{
        tasks,
        events,
        notices,
        courseNotices,
        courseTests,
        materials,
        disciplines,
        submissions,
        preferences,
        notifications,
        unreadNotificationCount,
        activeView,
        setActiveView,
        selectedCourseId,
        setSelectedCourseId,
        openCoursePortal,
        isCopilotOpen,
        setIsCopilotOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        campusBuildings,
        campusRooms,
        scheduleOverrides,
        getClassesForDate,
        addScheduleOverride,
        removeScheduleOverride,
        isMapModalOpen,
        setIsMapModalOpen,
        targetRoomForMap,
        setTargetRoomForMap,
        targetBuildingIdForMap,
        setTargetBuildingIdForMap,
        targetDateForMap,
        setTargetDateForMap,
        targetSessionForMap,
        setTargetSessionForMap,
        openLocationGuide,
        navigateToCampusMap,
        submitActivity,
        replaceSubmission,
        getSubmissionForTask,
        submitTestAnswers,
        addEvent,
        deleteEvent,
        toggleNotificationRead,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        saveProfile,
        updatePreferences,
        resetAllData,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </EduContext.Provider>
  );
};

export const useEdu = (): EduContextType => {
  const context = useContext(EduContext);
  if (!context) {
    throw new Error('useEdu must be used within an EduProvider');
  }
  return context;
};
