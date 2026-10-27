import React, { useState } from 'react';
import {
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Send,
  Loader2,
  Calendar,
} from 'lucide-react';
import { CourseTest } from '../types';
import { useEdu } from '../context/EduContext';

interface TestTakingModalProps {
  test: CourseTest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TestTakingModal: React.FC<TestTakingModalProps> = ({
  test,
  isOpen,
  onClose,
}) => {
  const { submitTestAnswers } = useEdu();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);
  const [completedResult, setCompletedResult] = useState<{ score: number } | null>(null);

  if (!isOpen || !test) return null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    setErrorMessage(null);
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === test.questions.length;

  const handleSubmit = async () => {
    if (!isAllAnswered) {
      setErrorMessage(
        `Você respondeu ${answeredCount} de ${test.questions.length} questões. Responda a todas antes de submeter.`
      );
      setShowConfirmationStep(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitTestAnswers(test.id, answers);
      if (res.success && res.score !== undefined) {
        setCompletedResult({ score: res.score });
      } else {
        setErrorMessage(res.error || 'Falha ao registrar respostas do teste.');
      }
    } catch {
      setErrorMessage('Erro ao submeter avaliação.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmationStep(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF0F7] text-[#203A65]">
                Avaliação Online Oficial
              </span>
              <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3 text-[#203A65]" />
                <span>{test.durationMinutes} minutos de duração</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {test.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{test.discipline}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar avaliação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Resultado de Conclusão */}
          {completedResult ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Avaliação Submetida com Sucesso!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Suas respostas foram gravadas formalmente no diário acadêmico com registro de confirmação.
                </p>
              </div>

              <div className="inline-block p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-xs text-emerald-800 block font-medium">Nota Calculada do Teste</span>
                <span className="text-3xl font-extrabold text-emerald-900 font-mono">
                  {completedResult.score.toFixed(1)} / 10.0
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Instruções do Teste */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center space-x-2 text-[#203A65] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Orientações da Coordenação Docente</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{test.instructions}</p>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center space-x-3">
                  <span>Total: {test.totalQuestions} questões</span>
                  <span>•</span>
                  <span>Respondidas: {answeredCount} de {test.totalQuestions}</span>
                </div>
              </div>

              {/* Lista de Questões */}
              <div className="space-y-6">
                {test.questions.map((q, qIndex) => {
                  const selectedOption = answers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#EAF0F7] text-[#203A65] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                          {q.question}
                        </p>
                      </div>

                      {/* Opções de Resposta */}
                      <div className="space-y-2 pl-8">
                        {q.options.map((opt, optIndex) => {
                          const isSelected = selectedOption === optIndex;
                          return (
                            <label
                              key={optIndex}
                              className={`flex items-start space-x-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#EAF0F7]/50 border-[#203A65] text-[#203A65] font-medium'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, optIndex)}
                                className="w-4 h-4 mt-0.5 text-[#203A65] focus:ring-[#203A65] border-slate-300 cursor-pointer"
                              />
                              <span className="leading-relaxed">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Rodapé com Confirmação e Submissão */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {completedResult ? 'Concluir e Fechar' : 'Sair da Avaliação'}
          </button>

          {!completedResult && (
            <div className="flex items-center space-x-2">
              {!showConfirmationStep ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isAllAnswered) {
                      setErrorMessage(
                        `Você ainda possui ${test.totalQuestions - answeredCount} questão(ões) sem resposta.`
                      );
                      return;
                    }
                    setShowConfirmationStep(true);
                  }}
                  disabled={!isAllAnswered || isSubmitting}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#203A65] hover:bg-[#182C4F] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Revisar e Submeter</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmationStep(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando Respostas...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar Envio Definitivo</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
