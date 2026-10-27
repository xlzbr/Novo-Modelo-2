import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  ShieldCheck,
  User,
  Target,
  CheckCircle2,
  Database,
  Info,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const SettingsView: React.FC = () => {
  const { preferences, saveProfile, resetAllData } = useEdu();

  const [studentName, setStudentName] = useState(preferences.studentName);
  const [studentEmail, setStudentEmail] = useState(preferences.studentEmail);
  const [courseName, setCourseName] = useState(preferences.courseName);
  const [semester, setSemester] = useState(preferences.semester);
  const [registrationNumber, setRegistrationNumber] = useState(preferences.registrationNumber || 'RA-2024-8192');
  const [weeklyGoal, setWeeklyGoal] = useState(String(preferences.weeklyTaskGoal));
  const [leadHours, setLeadHours] = useState(String(preferences.reminderLeadHours));

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Sincroniza campos quando preferences é alterado externamente
  useEffect(() => {
    setStudentName(preferences.studentName);
    setStudentEmail(preferences.studentEmail);
    setCourseName(preferences.courseName);
    setSemester(preferences.semester);
    setRegistrationNumber(preferences.registrationNumber || 'RA-2024-8192');
    setWeeklyGoal(String(preferences.weeklyTaskGoal));
    setLeadHours(String(preferences.reminderLeadHours));
  }, [preferences]);

  // Detecção de alterações pendentes
  const isDirty =
    studentName !== preferences.studentName ||
    studentEmail !== preferences.studentEmail ||
    courseName !== preferences.courseName ||
    semester !== preferences.semester ||
    registrationNumber !== (preferences.registrationNumber || 'RA-2024-8192') ||
    weeklyGoal !== String(preferences.weeklyTaskGoal) ||
    leadHours !== String(preferences.reminderLeadHours);

  const handleFieldChange = (field: string, value: string) => {
    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    switch (field) {
      case 'studentName':
        setStudentName(value);
        break;
      case 'studentEmail':
        setStudentEmail(value);
        break;
      case 'courseName':
        setCourseName(value);
        break;
      case 'semester':
        setSemester(value);
        break;
      case 'registrationNumber':
        setRegistrationNumber(value);
        break;
      case 'weeklyGoal':
        setWeeklyGoal(value);
        break;
      case 'leadHours':
        setLeadHours(value);
        break;
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!studentName.trim()) {
      errors.studentName = 'O nome do estudante é obrigatório.';
    } else if (studentName.trim().length < 2) {
      errors.studentName = 'O nome deve ter no mínimo 2 caracteres.';
    }

    const emailTrimmed = studentEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      errors.studentEmail = 'O e-mail é obrigatório.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.studentEmail = 'Informe um endereço de e-mail válido.';
    }

    if (!courseName.trim()) {
      errors.courseName = 'O curso é obrigatório.';
    }

    if (!semester.trim()) {
      errors.semester = 'O semestre é obrigatório.';
    }

    if (!registrationNumber.trim()) {
      errors.registrationNumber = 'A matrícula é obrigatória.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setSaveStatus('error');
      setErrorMessage('Por favor, verifique e preencha corretamente os campos destacados.');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage(null);

    const result = await saveProfile({
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseName: courseName.trim(),
      semester: semester.trim(),
      registrationNumber: registrationNumber.trim(),
      weeklyTaskGoal: Math.max(0, parseInt(weeklyGoal, 10) || 0),
      reminderLeadHours: parseInt(leadHours, 10) || 48,
    });

    if (result.success) {
      setSaveStatus('saved');
      setErrorMessage(null);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Falha ao gravar no armazenamento local persistente.');
    }
  };

  const handleCancel = () => {
    setStudentName(preferences.studentName);
    setStudentEmail(preferences.studentEmail);
    setCourseName(preferences.courseName);
    setSemester(preferences.semester);
    setRegistrationNumber(preferences.registrationNumber || 'RA-2024-8192');
    setWeeklyGoal(String(preferences.weeklyTaskGoal));
    setLeadHours(String(preferences.reminderLeadHours));
    setValidationErrors({});
    setErrorMessage(null);
    setSaveStatus('idle');
  };

  const handleConfirmReset = () => {
    resetAllData();
    setStudentName('Lucas Andrade');
    setStudentEmail('lucas.andrade@educonnect.app');
    setCourseName('Engenharia da Computação');
    setSemester('5º Semestre');
    setRegistrationNumber('RA-2024-8192');
    setWeeklyGoal('6');
    setLeadHours('48');
    setResetModalOpen(false);
    setSaveStatus('saved');
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Configurações & Perfil Acadêmico
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalize seus parâmetros de estudo, identificação discente e regras de alertas.
          </p>
        </div>

        {/* Indicador de Status Geral */}
        <div className="shrink-0">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Salvando...</span>
            </span>
          )}

          {saveStatus === 'saved' && !isDirty && (
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salvo</span>
            </span>
          )}

          {isDirty && (
            <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Alterações não salvas</span>
            </span>
          )}
        </div>
      </div>

      {/* Alertas de Erro ou Confirmação */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-in fade-in duration-150">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveStatus === 'saved' && !isDirty && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Alterações salvas com sucesso no armazenamento local persistente!</span>
        </div>
      )}

      {/* Formulário de Configurações */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Identificação do Estudante */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-[#203A65]" />
            <h3 className="font-bold text-sm text-slate-900">
              Dados do Estudante
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleFieldChange('studentName', e.target.value)}
                disabled={saveStatus === 'saving'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                  validationErrors.studentName
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#203A65] bg-white'
                }`}
              />
              {validationErrors.studentName && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.studentName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail de Contato <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => handleFieldChange('studentEmail', e.target.value)}
                disabled={saveStatus === 'saving'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                  validationErrors.studentEmail
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#203A65] bg-white'
                }`}
              />
              {validationErrors.studentEmail && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.studentEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matrícula (RA) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                disabled={saveStatus === 'saving'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 font-mono transition-all focus:outline-none focus:ring-2 ${
                  validationErrors.registrationNumber
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#203A65] bg-white'
                }`}
              />
              {validationErrors.registrationNumber && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.registrationNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Curso / Área de Estudo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => handleFieldChange('courseName', e.target.value)}
                disabled={saveStatus === 'saving'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                  validationErrors.courseName
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#203A65] bg-white'
                }`}
              />
              {validationErrors.courseName && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.courseName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semestre ou Período <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => handleFieldChange('semester', e.target.value)}
                disabled={saveStatus === 'saving'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                  validationErrors.semester
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-200 focus:ring-[#203A65] bg-white'
                }`}
              />
              {validationErrors.semester && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.semester}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 2: Parâmetros Acadêmicos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-[#203A65]" />
            <h3 className="font-bold text-sm text-slate-900">
              Metas e Regras de Lembretes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Semanal (Tarefas a Concluir)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={weeklyGoal}
                onChange={(e) => handleFieldChange('weeklyGoal', e.target.value)}
                disabled={saveStatus === 'saving'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#203A65]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Valor 0 desativa o cálculo percentual (indica meta não configurada).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Janela de Notificação de Prazos
              </label>
              <select
                value={leadHours}
                onChange={(e) => handleFieldChange('leadHours', e.target.value)}
                disabled={saveStatus === 'saving'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
              >
                <option value="24">24 horas de antecedência</option>
                <option value="48">48 horas de antecedência (Recomendado)</option>
                <option value="72">72 horas de antecedência</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Define quando os prazos começam a aparecer no sino de alertas.
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Ações: Salvar alterações & Cancelar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            {isDirty ? (
              <span className="text-amber-700 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Existem modificações pendentes de salvamento.</span>
              </span>
            ) : saveStatus === 'saved' ? (
              <span className="text-emerald-700 font-medium flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Todas as alterações estão salvas no navegador.</span>
              </span>
            ) : (
              <span>Nenhuma alteração pendente.</span>
            )}
          </div>

          <div className="flex items-center space-x-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saveStatus === 'saving' || !isDirty}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saveStatus === 'saving' || (!isDirty && saveStatus !== 'error')}
              className={`inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                saveStatus === 'saved' && !isDirty
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-[#203A65] hover:bg-[#182C4F] active:scale-[0.98]'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : saveStatus === 'saved' && !isDirty ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Salvo</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar alterações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Bloco 3: Transparência Técnica & Armazenamento Local */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-[#203A65]" />
          <h3 className="font-bold text-sm text-slate-900">
            Escopo de Persistência & Privacidade
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Persistência Local:</strong> Todos os seus dados de tarefas, agendas e configurações são salvos exclusivamente no armazenamento local do seu navegador (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">localStorage</code>).
            </p>
          </div>
          <div className="flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-[#203A65] shrink-0 mt-0.5" />
            <p>
              <strong>Independência Institucional:</strong> O Folium não compartilha suas atividades acadêmicas com terceiros e respeita as diretrizes de privacidade.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Deseja restaurar as tarefas e configurações de demonstração?
          </span>
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Dados Padrão</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmação para Restaurar Dados */}
      {resetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          role="alertdialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h4 className="font-bold text-base text-slate-900">
              Restaurar Dados de Demonstração?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Isso substituirá suas tarefas, blocos de agenda e preferências atuais pelos dados de demonstração originais do Folium.
            </p>
            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                Restaurar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
