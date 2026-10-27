import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';

import { Task, ViewType } from '../types';

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  bullets?: string[];
  actionLink?: {
    view: ViewType;
    label: string;
  };
}

export const CopilotModal: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    tasks,
    events,
    preferences,
    setActiveView,
  } = useEdu();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: 'Olá! Sou o Copiloto Folium. Ajudo você a organizar prioridades, dividir tarefas em blocos e acompanhar seus prazos com base exclusivamente nos seus dados acadêmicos reais.',
      bullets: [
        'Respostas curtas e objetivas',
        'Sugestões com base no seu quadro atual',
        'Nenhuma alteração na agenda sem sua confirmação direta',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isCopilotOpen, messages]);

  if (!isCopilotOpen) return null;

  // Análise real do estado acadêmico do estudante
  const pendingTasks = tasks.filter((t) => !t.completed);
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = pendingTasks.filter((t) => t.deadline && t.deadline < todayStr);
  const todayTasks = pendingTasks.filter((t) => t.deadline === todayStr);
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'Alta');
  const todayEvents = events.filter((e) => e.date === todayStr);
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Gera resposta analítica estritamente embasada nos dados reais
    setTimeout(() => {
      const q = queryText.toLowerCase();
      let reply: Message;

      if (q.includes('prioridade') || q.includes('fazer primeiro') || q.includes('hoje') || q.includes('foco')) {
        if (overdueTasks.length > 0) {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: `Atenção prioritária: você possui ${overdueTasks.length} tarefa(s) com prazo expirado.`,
            bullets: [
              `1ª prioridade: "${overdueTasks[0].title}" (${overdueTasks[0].discipline}) — prazo expirou em ${overdueTasks[0].deadline}.`,
              overdueTasks.length > 1
                ? `Existem outras ${overdueTasks.length - 1} pendência(s) atrasada(s).`
                : 'Regularize esta entrega antes de iniciar novos blocos.',
            ],
            actionLink: { view: 'tasks', label: 'Ver Tarefas Atrasadas' },
          };
        } else if (todayTasks.length > 0) {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: `Foco de hoje: você tem ${todayTasks.length} tarefa(s) agendada(s) para entrega hoje.`,
            bullets: [
              `"${todayTasks[0].title}" (${todayTasks[0].discipline}) com prioridade ${todayTasks[0].priority}.`,
              todayEvents.length > 0
                ? `Você já tem ${todayEvents.length} sessão(ões) reservada(s) na agenda de hoje.`
                : 'Dica: reserve um bloco de estudo de 60 ou 90 minutos na Agenda para focar nesta entrega.',
            ],
            actionLink: { view: 'tasks', label: 'Conferir Tarefas de Hoje' },
          };
        } else if (highPriorityTasks.length > 0) {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: `Recomendação: foque na tarefa de alta prioridade mais próxima.`,
            bullets: [
              `"${highPriorityTasks[0].title}" (${highPriorityTasks[0].discipline}).`,
              highPriorityTasks[0].deadline
                ? `Prazo de entrega: ${highPriorityTasks[0].deadline}.`
                : 'Atividade sem prazo limite cadastrado.',
            ],
            actionLink: { view: 'tasks', label: 'Acessar Tarefa' },
          };
        } else if (pendingTasks.length > 0) {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: `Seu quadro está sem emergências imediatas.`,
            bullets: [
              `Próxima pendência: "${pendingTasks[0].title}" (${pendingTasks[0].discipline}).`,
              'Aproveite para adiantar leituras e preparar revisões na Agenda.',
            ],
            actionLink: { view: 'tasks', label: 'Ver Quadro Geral' },
          };
        } else {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: 'Excelente! Você não possui nenhuma tarefa pendente no momento.',
            bullets: ['Todas as atividades cadastradas estão concluídas.'],
          };
        }
      } else if (q.includes('meta') || q.includes('progresso') || q.includes('semanal')) {
        const goal = preferences.weeklyTaskGoal;
        if (goal <= 0) {
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: 'Sua meta semanal ainda não está definida nas configurações.',
            bullets: [
              `Você já concluiu ${completedCount} tarefa(s) até agora.`,
              'Defina uma meta numérica (ex: 6 tarefas) para acompanhar a porcentagem real.',
            ],
            actionLink: { view: 'progress', label: 'Ver Progresso' },
          };
        } else {
          const percent = Math.round((completedCount / goal) * 100);
          reply = {
            id: `cop-${Date.now()}`,
            sender: 'copilot',
            text: `Status da meta semanal: ${completedCount} de ${goal} tarefas concluídas (${percent}%).`,
            bullets: [
              completedCount >= goal
                ? `Meta atingida com sucesso! Você superou o objetivo.`
                : `Faltam ${goal - completedCount} tarefa(s) para atingir seu objetivo da semana.`,
              'Cada tarefa única concluída é computada apenas uma vez.',
            ],
            actionLink: { view: 'progress', label: 'Ir para Metas' },
          };
        }
      } else if (q.includes('etapa') || q.includes('dividir') || q.includes('bloco') || q.includes('estudo') || q.includes('cronograma')) {
        reply = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: 'Como dividir tarefas complexas em etapas acadêmicas produtivas:',
          bullets: [
            '1. Etapa de Leitura/Estruturação (30 a 45 min): levantar materiais e sumário;',
            '2. Etapa de Desenvolvimento (60 a 90 min): resolver exercícios ou redação de tópicos;',
            '3. Etapa de Revisão Final (20 a 30 min): conferir formatação e requisitos do professor.',
            'Lembrete: adicione essas sessões diretamente na sua Agenda Diária.',
          ],
          actionLink: { view: 'schedule', label: 'Planejar na Agenda' },
        };
      } else {
        reply = {
          id: `cop-${Date.now()}`,
          sender: 'copilot',
          text: `Resumo do seu ambiente acadêmico:`,
          bullets: [
            `${pendingTasks.length} tarefa(s) pendente(s) e ${completedCount} concluída(s).`,
            `${overdueTasks.length} tarefa(s) com prazo expirado.`,
            `${todayEvents.length} sessão(ões) de estudo agendada(s) para hoje.`,
            'Qualquer alteração na agenda deve ser manualmente escolhida por você.',
          ],
          actionLink: { view: 'dashboard', label: 'Acessar Dashboard' },
        };
      }

      setMessages((prev) => [...prev, reply]);
    }, 250);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery(input);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-title"
    >
      <div
        className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[580px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Copiloto */}
        <div className="bg-[#203A65] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 id="copilot-title" className="font-bold text-sm text-white">
                  Copiloto Folium
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <p className="text-[11px] text-white/70">
                Orientação acadêmica baseada em dados reais
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar Copiloto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avisos Rápidos */}
        <div className="bg-[#EAF0F7] px-4 py-2 text-[11px] text-[#203A65] flex items-center justify-between border-b border-[#203A65]/10 shrink-0">
          <span className="font-medium">Assistente Acadêmico Local</span>
          <span className="text-slate-600">Sem alterações automáticas</span>
        </div>

        {/* Histórico de Mensagens */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F6F7F9]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#203A65] text-white rounded-br-none shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-none shadow-xs'
                }`}
              >
                <p className="font-medium">{m.text}</p>

                {m.bullets && m.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {m.bullets.map((b, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-[#203A65] font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {m.actionLink && (
                  <button
                    onClick={() => {
                      setActiveView(m.actionLink!.view);
                      setIsCopilotOpen(false);
                    }}
                    className="mt-2.5 inline-flex items-center space-x-1 text-xs font-semibold text-[#203A65] hover:underline cursor-pointer"
                  >
                    <span>{m.actionLink.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Ação Rápida */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => handleQuery('Qual minha prioridade hoje?')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#EAF0F7] hover:text-[#203A65] text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
          >
            Qual minha prioridade?
          </button>
          <button
            type="button"
            onClick={() => handleQuery('Como está minha meta semanal?')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#EAF0F7] hover:text-[#203A65] text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
          >
            Meta Semanal
          </button>
          <button
            type="button"
            onClick={() => handleQuery('Como dividir minhas tarefas em etapas?')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#EAF0F7] hover:text-[#203A65] text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 font-medium"
          >
            Dividir em Etapas
          </button>
        </div>

        {/* Input */}
        <form
          onSubmit={handleFormSubmit}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre prioridades, prazos ou estudos..."
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-[#203A65] text-white rounded-xl hover:bg-[#182C4F] active:scale-95 disabled:opacity-50 transition-all cursor-pointer shrink-0"
            aria-label="Enviar pergunta ao Copiloto"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
