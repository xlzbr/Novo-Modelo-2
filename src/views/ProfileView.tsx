import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Mail,
  Calendar,
  BookOpen,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  IdCard,
  Edit3,
  Save,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const ProfileView: React.FC = () => {
  const { preferences, saveProfile, tasks, disciplines, setActiveView } = useEdu();

  // Estados dos campos do formulário de perfil
  const [studentName, setStudentName] = useState(preferences.studentName);
  const [studentEmail, setStudentEmail] = useState(preferences.studentEmail);
  const [courseName, setCourseName] = useState(preferences.courseName);
  const [semester, setSemester] = useState(preferences.semester);
  const [registrationNumber, setRegistrationNumber] = useState(preferences.registrationNumber || 'RA-2024-8192');

  // Controle de edição e feedback
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sincroniza campos quando preferences é carregado ou modificado externamente
  useEffect(() => {
    setStudentName(preferences.studentName);
    setStudentEmail(preferences.studentEmail);
    setCourseName(preferences.courseName);
    setSemester(preferences.semester);
    setRegistrationNumber(preferences.registrationNumber || 'RA-2024-8192');
  }, [preferences]);

  // Detecção de alterações pendentes (dirty state)
  const isDirty =
    studentName !== preferences.studentName ||
    studentEmail !== preferences.studentEmail ||
    courseName !== preferences.courseName ||
    semester !== preferences.semester ||
    registrationNumber !== (preferences.registrationNumber || 'RA-2024-8192');

  // Se o usuário alterar qualquer campo após salvar, o indicador volta imediatamente para "Alterações não salvas"
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
    }
  };

  // Validação dos campos
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!studentName.trim()) {
      errors.studentName = 'O nome do estudante é obrigatório e não pode ficar em branco.';
    } else if (studentName.trim().length < 2) {
      errors.studentName = 'O nome deve ter no mínimo 2 caracteres.';
    }

    const emailTrimmed = studentEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed) {
      errors.studentEmail = 'O e-mail de contato institucional é obrigatório.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.studentEmail = 'Informe um endereço de e-mail institucional válido.';
    }

    if (!courseName.trim()) {
      errors.courseName = 'O curso matriculado é obrigatório.';
    }

    if (!semester.trim()) {
      errors.semester = 'O semestre letivo é obrigatório.';
    }

    if (!registrationNumber.trim()) {
      errors.registrationNumber = 'O número de matrícula (RA) é obrigatório.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submissão real com gravação persistente
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validate()) {
      setSaveStatus('error');
      setErrorMessage('Corrija os campos indicados antes de salvar.');
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
    });

    if (result.success) {
      setSaveStatus('saved');
      setErrorMessage(null);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Não foi possível salvar as alterações no perfil.');
    }
  };

  // Descartar alterações não salvas
  const handleCancel = () => {
    setStudentName(preferences.studentName);
    setStudentEmail(preferences.studentEmail);
    setCourseName(preferences.courseName);
    setSemester(preferences.semester);
    setRegistrationNumber(preferences.registrationNumber || 'RA-2024-8192');
    setValidationErrors({});
    setErrorMessage(null);
    setSaveStatus('idle');
    setIsEditMode(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Topo com Título e Ação de Edição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Meu Perfil Acadêmico
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identificação estudantil, curso matriculado e dados curriculares persistidos.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {!isEditMode ? (
            <button
              onClick={() => {
                setIsEditMode(true);
                setSaveStatus('idle');
              }}
              className="inline-flex items-center space-x-2 bg-[#203A65] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#182C4F] transition-all shadow-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="inline-flex items-center space-x-1.5 bg-white text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Fechar Edição</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('settings')}
            className="inline-flex items-center space-x-2 bg-white text-[#203A65] border border-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Acessar preferências gerais e metas"
          >
            <SettingsIcon className="w-4 h-4 text-[#203A65]" />
            <span className="hidden sm:inline">Configurações Gerais</span>
          </button>
        </div>
      </div>

      {/* FORMULÁRIO DE EDIÇÃO DO PERFIL (QUANDO ATIVO) */}
      {isEditMode && (
        <div className="bg-white rounded-2xl border-2 border-[#203A65]/20 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EAF0F7] text-[#203A65] flex items-center justify-center font-bold">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Formulário de Edição do Perfil
                </h3>
                <p className="text-xs text-slate-500">
                  Atualize suas informações cadastrais acadêmicas com persistência local verificada.
                </p>
              </div>
            </div>

            {/* Indicador de Status Visual do Formulário */}
            <div>
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Salvando...</span>
                </span>
              )}

              {saveStatus === 'saved' && !isDirty && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Salvo</span>
                </span>
              )}

              {isDirty && (
                <span className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Alterações não salvas</span>
                </span>
              )}
            </div>
          </div>

          {/* Mensagem de Erro de Gravação ou Validação */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Não foi possível salvar</p>
                <p className="text-[11px] text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Mensagem de Confirmação de Sucesso */}
          {saveStatus === 'saved' && !isDirty && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Alterações salvas com sucesso! As informações foram sincronizadas no cabeçalho e armazenadas localmente.
              </span>
            </div>
          )}

          {/* Grid de Campos do Formulário */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Estudante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => handleFieldChange('studentName', e.target.value)}
                  placeholder="Ex: Lucas Andrade"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                    validationErrors.studentName
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:ring-[#203A65] bg-white'
                  }`}
                  disabled={saveStatus === 'saving'}
                />
                {validationErrors.studentName && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.studentName}</p>
                )}
              </div>

              {/* E-mail de Contato */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail de Contato Institucional <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => handleFieldChange('studentEmail', e.target.value)}
                  placeholder="lucas.andrade@educonnect.app"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                    validationErrors.studentEmail
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:ring-[#203A65] bg-white'
                  }`}
                  disabled={saveStatus === 'saving'}
                />
                {validationErrors.studentEmail && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.studentEmail}</p>
                )}
              </div>

              {/* Matrícula / RA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matrícula / RA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                  placeholder="RA-2024-8192"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 font-mono transition-all focus:outline-none focus:ring-2 ${
                    validationErrors.registrationNumber
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:ring-[#203A65] bg-white'
                  }`}
                  disabled={saveStatus === 'saving'}
                />
                {validationErrors.registrationNumber && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.registrationNumber}</p>
                )}
              </div>

              {/* Curso de Graduação */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curso de Graduação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => handleFieldChange('courseName', e.target.value)}
                  placeholder="Engenharia da Computação"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                    validationErrors.courseName
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:ring-[#203A65] bg-white'
                  }`}
                  disabled={saveStatus === 'saving'}
                />
                {validationErrors.courseName && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.courseName}</p>
                )}
              </div>

              {/* Semestre / Período */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semestre / Período Letivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => handleFieldChange('semester', e.target.value)}
                  placeholder="5º Semestre"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                    validationErrors.semester
                      ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                      : 'border-slate-200 focus:ring-[#203A65] bg-white'
                  }`}
                  disabled={saveStatus === 'saving'}
                />
                {validationErrors.semester && (
                  <p className="text-[11px] text-red-600 mt-1">{validationErrors.semester}</p>
                )}
              </div>
            </div>

            {/* Barra de Ações: Salvar alterações & Cancelar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {isDirty ? (
                  <span className="text-amber-700 font-medium flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Você possui alterações não salvas.</span>
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="text-emerald-700 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dados salvos no armazenamento local.</span>
                  </span>
                ) : (
                  <span>Nenhuma alteração pendente.</span>
                )}
              </div>

              <div className="flex items-center space-x-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saveStatus === 'saving' || (!isDirty && saveStatus !== 'error')}
                  className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
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
        </div>
      )}

      {/* Cartão de Identificação Principal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-[#EAF0F7] text-[#203A65] flex items-center justify-center font-bold text-2xl border-2 border-[#203A65]/20 shadow-inner shrink-0">
            <User className="w-10 h-10" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {preferences.studentName}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Regular / Matriculado
              </span>
              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="text-xs font-semibold text-[#203A65] hover:underline flex items-center space-x-1 ml-2 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            <p className="text-sm font-semibold text-[#203A65] mt-1 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>{preferences.courseName}</span>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-mono">
              <span className="flex items-center space-x-1.5">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Matrícula: {preferences.registrationNumber || 'RA-2024-8192'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{preferences.studentEmail}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{preferences.semester}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas do Estudante */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase">Disciplinas Ativas</span>
            <p className="text-2xl font-bold text-[#203A65] font-mono mt-1">{disciplines.length}</p>
            <span className="text-[11px] text-slate-400">Neste semestre</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase">Tarefas Concluídas</span>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-1">{completedCount}</p>
            <span className="text-[11px] text-slate-400">Atividades entregues</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase">Pendências Atuais</span>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-1">{pendingCount}</p>
            <span className="text-[11px] text-slate-400">Aguardando entrega</span>
          </div>
        </div>
      </div>

      {/* Grade de Disciplinas do Aluno */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#203A65]" />
            <h3 className="font-bold text-base text-slate-900">
              Disciplinas Matriculadas ({disciplines.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveView('disciplines')}
            className="text-xs font-semibold text-[#203A65] hover:underline cursor-pointer"
          >
            Ver detalhes das disciplinas →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {disciplines.map((d) => (
            <div key={d.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{d.name}</span>
                <span className="font-mono text-slate-400">{d.code}</span>
              </div>
              <p className="text-slate-500 mt-1">{d.workload} • {d.room || 'Presencial'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nota de Privacidade e Autenticação */}
      <div className="p-4 rounded-2xl bg-[#EAF0F7]/40 border border-[#203A65]/10 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-[#203A65] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Vínculo do Estudante:</strong> Este perfil reflete as informações acadêmicas do estudante registradas para o ambiente do Folium. Os dados de tarefas e sessões são persistidos no navegador local.
        </p>
      </div>
    </div>
  );
};
