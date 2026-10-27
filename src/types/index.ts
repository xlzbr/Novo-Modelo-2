export type Priority = 'Baixa' | 'Média' | 'Alta';

export interface Task {
  id: string;
  courseId?: string;
  title: string;
  discipline: string;
  description?: string;
  instructions?: string;
  deadline?: string; // Formato YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  submissionType?: string; // ex: "Envio de Arquivo PDF", "Arquivo (.zip / .tar.gz)"
  allowedExtensions?: string[]; // ex: ['.pdf', '.docx', '.zip', '.png']
  maxSizeBytes?: number; // ex: 15 * 1024 * 1024 (15 MB)
  supportMaterials?: { title: string; url: string; type: string }[];
  publishedBy?: string; // ex: "Gestão Acadêmica / Prof. Dr. Silva"
  allowsResubmission?: boolean;
}

export interface ActivitySubmission {
  id: string;
  taskId: string;
  courseId?: string;
  fileName: string;
  fileSize: number; // Em bytes
  fileType: string;
  submittedAt: string; // ISO date string
  isLate: boolean;
  status: 'submitted' | 'late';
  notes?: string;
  fileDataUrl?: string; // data URL do arquivo para download e prévia local
  submissionReceiptId: string;
  history?: { fileName: string; submittedAt: string; isLate: boolean; fileSize: number }[];
}

export interface ScheduleEvent {
  id: string;
  taskId?: string;
  title?: string;
  discipline?: string;
  date: string; // Formato YYYY-MM-DD
  startTime: string; // Formato HH:mm (ex: "14:00")
  durationMinutes: number; // ex: 60, 90, 120
  location?: string; // Sala, laboratório ou endereço do compromisso (ex: "Sala 204 - Bloco C")
  notes?: string;
  type?: 'aula' | 'estudo' | 'revisao' | 'laboratorio';
}

export interface AcademicNotice {
  id: string;
  courseId?: string;
  title: string;
  message: string;
  discipline?: string;
  date: string; // Formato YYYY-MM-DD
  priority?: 'Alta' | 'Média' | 'Informativo';
  author?: string;
}

export interface CourseNotice {
  id: string;
  courseId: string;
  discipline: string;
  title: string;
  message: string;
  author: string;
  publishedAt: string;
  priority: 'Importante' | 'Informativo';
  attachments?: { title: string; url: string }[];
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex?: number;
}

export interface CourseTest {
  id: string;
  courseId: string;
  discipline: string;
  title: string;
  description: string;
  instructions: string;
  deadline: string; // Formato YYYY-MM-DD
  durationMinutes: number;
  totalQuestions: number;
  questions: TestQuestion[];
  status: 'Pendente' | 'Realizado' | 'Expirado';
  submittedAt?: string;
  score?: number;
  userAnswers?: Record<string, number>;
}

export interface StudyMaterial {
  id: string;
  courseId?: string;
  title: string;
  discipline: string;
  type: 'PDF' | 'Link' | 'Slide' | 'Apostila';
  url: string;
  dateAdded: string;
  description?: string;
  fileSize?: string;
}

export interface InstructorInfo {
  name: string;
  title: string;
  department: string;
  office: string;
  email: string;
  officeHours: string;
}

export interface DisciplineInfo {
  id: string;
  name: string;
  code: string;
  workload: string;
  room?: string;
  instructor?: InstructorInfo;
  weeklySchedule: { dayOfWeek: string; time: string; room?: string }[];
  description?: string;
  officialLinks?: { title: string; url: string; type: string }[];
}

export interface UserPreferences {
  weeklyTaskGoal: number; // Quantidade de tarefas a concluir na semana
  reminderLeadHours: number; // Horas de antecedência para notificações (ex: 24, 48, 72)
  studentName: string;
  studentEmail: string;
  courseName: string;
  semester: string;
  registrationNumber?: string;
  theme?: 'light' | 'dark';
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  noticeId?: string;
  title: string;
  message: string;
  type: 'overdue' | 'due_soon' | 'announcement';
  date: string;
  read: boolean;
}

export type ViewType =
  | 'dashboard'
  | 'tasks'
  | 'schedule'
  | 'calendar'
  | 'disciplines'
  | 'progress'
  | 'materials'
  | 'notices'
  | 'profile'
  | 'settings'
  | 'campus-map';

export interface CampusPath {
  id: string;
  name: string;
  fromId: string;
  toBuildingId: string;
  points3D: [number, number, number][];
  distanceMeters: number;
  isAccessible: boolean;
}

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  shortName: string;
  floorsCount: number;
  floorsDesc: string;
  departments: string[];
  facilities: string[];
  directions: string;
  gate: string;
  accessibility: string[];
  // Coordenadas esquemáticas no espaço 3D Three.js
  position3D: [number, number, number];
  dimensions3D: [number, number, number];
  colorHex: string;
  entrancePosition3D?: [number, number, number];
  style?: 'academic_glass' | 'tech_pavilion' | 'library_monument' | 'contemporary_lab' | 'civic_admin' | 'terrace_pavilion';
}

export interface CampusRoom {
  id: string;
  buildingId: string;
  code: string; // ex: "Sala 204", "Lab 105"
  name: string;
  floor: string; // ex: "2º Pavimento"
  floorNumber: number; // 0 = Térreo, 1 = 1º Andar, etc.
  type: 'sala_teorica' | 'laboratorio' | 'auditorio' | 'biblioteca' | 'administrativo' | 'convivencia';
  capacity: number;
  accessibilityNotes: string;
  equipment?: string[];
}

export interface ScheduleOverride {
  id: string;
  date: string; // YYYY-MM-DD
  disciplineId: string;
  disciplineName: string;
  originalBuildingId: string;
  originalRoom: string;
  newBuildingId: string;
  newRoom: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface CampusRouteStep {
  stepNumber: number;
  title: string;
  instruction: string;
  iconType: 'gate' | 'walk' | 'entrance' | 'elevator' | 'stairs' | 'door';
  isAccessible: boolean;
}

export interface ResolvedClassSession {
  id: string;
  disciplineId: string;
  disciplineName: string;
  code: string;
  instructor: string;
  date: string; // YYYY-MM-DD
  time: string; // ex: "08:00 - 10:00"
  startTime: string; // ex: "08:00"
  endTime: string; // ex: "10:00"
  buildingId: string;
  buildingName: string;
  buildingCode: string;
  room: string;
  floor: string;
  gate: string;
  turma: string;
  isOverride: boolean;
  overrideReason?: string;
  overrideAuthor?: string;
}

