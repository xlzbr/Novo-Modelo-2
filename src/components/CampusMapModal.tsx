import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  MapPin,
  Building,
  Navigation,
  Compass,
  Layers,
  Clock,
  Info,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Accessibility,
  Footprints,
  DoorOpen,
  PlusCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { CampusMap3D } from './CampusMap3D';
import { CampusBuilding, CampusRoom, ResolvedClassSession } from '../types';
import { generateRouteSteps } from '../data/campusData';

interface CampusMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoom?: string;
}

export const CampusMapModal: React.FC<CampusMapModalProps> = ({ isOpen, onClose, targetRoom }) => {
  const {
    campusBuildings,
    campusRooms,
    scheduleOverrides,
    getClassesForDate,
    addScheduleOverride,
    removeScheduleOverride,
    disciplines,
  } = useEdu();

  // Date selection state (default today YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // View Mode: '3d' | 'list'
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');

  // Selected building and room
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('bloco-a');
  const [activeRoomCode, setActiveRoomCode] = useState<string>('Sala 204');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Route panel visibility and accessibility preference
  const [isRouteOpen, setIsRouteOpen] = useState<boolean>(false);
  const [preferElevator, setPreferElevator] = useState<boolean>(true);

  // Admin Room Override Modal state
  const [isAdminOverrideOpen, setIsAdminOverrideOpen] = useState<boolean>(false);
  const [adminDisciplineId, setAdminDisciplineId] = useState<string>('disc-1');
  const [adminTargetDate, setAdminTargetDate] = useState<string>(todayStr);
  const [adminNewBuildingId, setAdminNewBuildingId] = useState<string>('bloco-c');
  const [adminNewRoom, setAdminNewRoom] = useState<string>('Sala 102 — Bloco C');
  const [adminReason, setAdminReason] = useState<string>('Manutenção técnica emergencial no laboratório');

  // Synchronize targetRoom prop when modal opens
  useEffect(() => {
    if (targetRoom && isOpen) {
      setActiveRoomCode(targetRoom);
      const lower = targetRoom.toLowerCase();
      if (lower.includes('bloco b') || lower.includes('302')) {
        setSelectedBuildingId('bloco-b');
      } else if (lower.includes('bloco c') || lower.includes('105') || lower.includes('102')) {
        setSelectedBuildingId('bloco-c');
      } else if (lower.includes('biblioteca')) {
        setSelectedBuildingId('biblioteca');
      } else if (lower.includes('reitoria') || lower.includes('secretaria')) {
        setSelectedBuildingId('reitoria');
      } else if (lower.includes('convivência') || lower.includes('alimentação')) {
        setSelectedBuildingId('convivencia');
      } else {
        setSelectedBuildingId('bloco-a');
      }
    }
  }, [targetRoom, isOpen]);

  // Classes for the selected date
  const classesForDate = useMemo<ResolvedClassSession[]>(() => {
    return getClassesForDate(selectedDate);
  }, [getClassesForDate, selectedDate]);

  // Current selected building object
  const currentBuilding = useMemo<CampusBuilding>(() => {
    return (
      campusBuildings.find((b) => b.id === selectedBuildingId) ||
      campusBuildings[0]
    );
  }, [campusBuildings, selectedBuildingId]);

  // Rooms in the current selected building
  const buildingRooms = useMemo<CampusRoom[]>(() => {
    return campusRooms.filter((r) => r.buildingId === currentBuilding.id);
  }, [campusRooms, currentBuilding.id]);

  // Search filtered buildings and rooms
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const matchedBuildings = campusBuildings.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        b.departments.some((d) => d.toLowerCase().includes(q)) ||
        b.facilities.some((f) => f.toLowerCase().includes(q))
    );

    const matchedRooms = campusRooms.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.floor.toLowerCase().includes(q) ||
        (r.equipment && r.equipment.some((e) => e.toLowerCase().includes(q)))
    );

    return { matchedBuildings, matchedRooms };
  }, [campusBuildings, campusRooms, searchQuery]);

  // Filtered rooms for the current building based on category
  const filteredRooms = useMemo(() => {
    if (activeCategory === 'all') return buildingRooms;
    if (activeCategory === 'labs') return buildingRooms.filter((r) => r.type === 'laboratorio');
    if (activeCategory === 'theory') return buildingRooms.filter((r) => r.type === 'sala_teorica');
    if (activeCategory === 'study') return buildingRooms.filter((r) => r.type === 'biblioteca');
    return buildingRooms;
  }, [buildingRooms, activeCategory]);

  // Route steps
  const routeSteps = useMemo(() => {
    return generateRouteSteps(currentBuilding, activeRoomCode, preferElevator);
  }, [currentBuilding, activeRoomCode, preferElevator]);

  // Relative Date Helper
  const getRelativeDateStr = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Format date display
  const formattedDateTitle = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d, 12, 0, 0);
      return dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Handle focus on class location
  const handleSelectClass = (c: ResolvedClassSession) => {
    setSelectedBuildingId(c.buildingId);
    setActiveRoomCode(c.room);
    setIsRouteOpen(false);
  };

  // Submit Admin Override
  const handleCreateOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const disc = disciplines.find((d) => d.id === adminDisciplineId);
    if (!disc) return;

    addScheduleOverride({
      date: adminTargetDate,
      disciplineId: disc.id,
      disciplineName: disc.name,
      originalBuildingId: 'bloco-a',
      originalRoom: 'Sala 204 — Bloco A',
      newBuildingId: adminNewBuildingId,
      newRoom: adminNewRoom,
      reason: adminReason,
      createdBy: 'Gestão Acadêmica / Coordenação Folium',
    });

    setIsAdminOverrideOpen(false);
    setSelectedDate(adminTargetDate);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campus-location-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* ===================================================================== */}
        {/* TOP HEADER: INSTITUTIONAL FOLIUM BRANDING & CONTROLS                  */}
        {/* ===================================================================== */}
        <div className="bg-[#203A65] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 id="campus-location-title" className="text-base sm:text-lg font-bold tracking-tight truncate">
                  Localização e Mapa do Campus Folium
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/90">
                  Grade Integrada
                </span>
              </div>
              <p className="text-xs text-white/70 truncate">
                Consulta em tempo real de horários, blocos, andares e rotas de acesso
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="bg-black/20 p-1 rounded-xl flex items-center space-x-1">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-white text-[#203A65] shadow-xs'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                title="Modo Tridimensional"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mapa 3D</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#203A65] shadow-xs'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
                title="Lista Acessível de Instalações"
              >
                <Building className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista Acessível</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              aria-label="Fechar janela de localização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* BARRA SUPERIOR: DATA ACADÊMICA & GRADE HORÁRIA DO DIA                 */}
        {/* ===================================================================== */}
        <div className="bg-[#EAF0F7] border-b border-slate-200/80 p-3 sm:p-4 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Seletor de Data */}
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Calendar className="w-4 h-4 text-[#203A65]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  aria-label="Selecionar data da consulta"
                />
              </div>

              {/* Botões rápidos de data */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDate === todayStr
                      ? 'bg-[#203A65] text-white'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setSelectedDate(getRelativeDateStr(1))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDate === getRelativeDateStr(1)
                      ? 'bg-[#203A65] text-white'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Amanhã
                </button>
                <button
                  onClick={() => setSelectedDate(getRelativeDateStr(2))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedDate === getRelativeDateStr(2)
                      ? 'bg-[#203A65] text-white'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  +2 dias
                </button>
              </div>
            </div>

            {/* Turma do Aluno e Botão de Gestão */}
            <div className="flex items-center justify-between md:justify-end space-x-3 text-xs">
              <span className="text-slate-600 font-medium capitalize">
                {formattedDateTitle} • <strong className="text-slate-800">Turma A</strong>
              </span>

              {/* Botão de Simulação da Gestão Acadêmica */}
              <button
                onClick={() => setIsAdminOverrideOpen(true)}
                className="text-[11px] font-bold text-[#203A65] hover:text-[#182C4F] bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                title="Simular alteração emergencial de sala pela Gestão Acadêmica"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Gestão: Alterar sala</span>
              </button>
            </div>
          </div>

          {/* Lista Horizontal de Aulas para a Data Selecionada */}
          <div className="mt-3">
            {classesForDate.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {classesForDate.map((cls) => {
                  const isSelected = activeRoomCode === cls.room;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleSelectClass(cls)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        cls.isOverride
                          ? isSelected
                            ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                            : 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                          : isSelected
                          ? 'bg-white border-[#203A65] ring-2 ring-[#203A65]/20 shadow-xs'
                          : 'bg-white/90 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Badge de Alteração Excepcional da Gestão */}
                      {cls.isOverride && (
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          <span className="flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                            <span>Alteração excepcional pela gestão</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                              {cls.code}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {cls.disciplineName}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-slate-600 mt-1">
                            <span className="flex items-center space-x-1 font-semibold text-slate-700">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{cls.time}</span>
                            </span>
                            <span>•</span>
                            <span className="truncate">{cls.instructor}</span>
                          </div>

                          <div className="flex items-center space-x-1 text-xs font-bold text-[#203A65] mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                            <span className="truncate">{cls.room} ({cls.floor})</span>
                          </div>

                          {cls.isOverride && cls.overrideReason && (
                            <p className="text-[10px] text-amber-800 mt-1 leading-tight line-clamp-2 italic">
                              Motivo: {cls.overrideReason}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectClass(cls);
                            setIsRouteOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-[#203A65] hover:bg-[#182C4F] text-white text-[10px] font-bold flex items-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                        >
                          <span>Rota</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/80 p-3 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs text-slate-600 font-medium">
                  Nenhuma aula regular programada para <span className="font-bold">{formattedDateTitle}</span>. O campus, a biblioteca e as salas de estudo permanecem abertos para pesquisa e estudo dirigido.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CORPO DO MODAL: MAPA 3D OU LISTA ACESSÍVEL + BUSCA & DETALHES         */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Barra de Pesquisa Rápida e Filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar prédio, sala (ex: 204, 302, 105), laboratório ou biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#203A65]/30 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Categorias */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#203A65] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveCategory('labs')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeCategory === 'labs'
                    ? 'bg-[#203A65] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Laboratórios
              </button>
              <button
                onClick={() => setActiveCategory('theory')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeCategory === 'theory'
                    ? 'bg-[#203A65] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Salas de Aula
              </button>
              <button
                onClick={() => setActiveCategory('study')}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeCategory === 'study'
                    ? 'bg-[#203A65] text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Biblioteca
              </button>
            </div>
          </div>

          {/* Sugestões de busca se o usuário digitou */}
          {searchResults && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Resultados da busca ({searchResults.matchedBuildings.length + searchResults.matchedRooms.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.matchedRooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedBuildingId(r.buildingId);
                      setActiveRoomCode(r.code);
                      setSearchQuery('');
                    }}
                    className="p-2 bg-white rounded-xl border border-slate-200 hover:border-[#203A65] text-left text-xs flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <strong className="text-slate-900 group-hover:text-[#203A65] font-bold">{r.code}</strong> — {r.name}
                      <p className="text-[10px] text-slate-500">{r.floor}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#203A65]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* SELEÇÃO DE MODO: MAPA 3D OU LISTA ACESSÍVEL                         */}
          {/* =================================================================== */}
          {viewMode === '3d' ? (
            <div className="space-y-3">
              <CampusMap3D
                buildings={campusBuildings}
                selectedBuildingId={selectedBuildingId}
                onSelectBuilding={(bId) => {
                  setSelectedBuildingId(bId);
                  setIsRouteOpen(false);
                }}
                targetRoom={activeRoomCode}
              />

              {/* Botões rápidos de prédios */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {campusBuildings.map((b) => {
                  const isSelected = b.id === selectedBuildingId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBuildingId(b.id);
                        setIsRouteOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#203A65] text-white border-[#203A65] font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`font-mono text-[10px] block mb-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {b.code}
                      </div>
                      <span className="truncate block font-semibold">{b.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MODO LISTA ACESSÍVEL */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {campusBuildings.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF0F7] border-[#203A65] ring-2 ring-[#203A65]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#203A65] text-white">
                          {b.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{b.shortName}</h4>
                      </div>
                      <span className="text-xs text-slate-500">{b.floorsDesc}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{b.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1 italic">{b.directions}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================================== */}
          {/* DETALHES DO PRÉDIO SELECIONADO & SALAS DISPONÍVEIS                  */}
          {/* =================================================================== */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#203A65] text-white">
                    {currentBuilding.code}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-[#203A65]" />
                    <span>{currentBuilding.name}</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentBuilding.floorsDesc}</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF0F7] text-[#203A65]">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{currentBuilding.gate}</span>
                </span>
                <button
                  onClick={() => setIsRouteOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#203A65] hover:bg-[#182C4F] text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Ver rota até a sala</span>
                </button>
              </div>
            </div>

            {/* Como chegar & Instruções de Acessibilidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#203A65]" />
                  <span>Instruções de acesso e circulação:</span>
                </span>
                <p className="text-slate-600 leading-relaxed">{currentBuilding.directions}</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-blue-600" />
                  <span>Recursos de acessibilidade:</span>
                </span>
                <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
                  {currentBuilding.accessibility.map((acc, i) => (
                    <li key={i} className="truncate">{acc}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Salas deste Bloco */}
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 mb-2.5">
                <Layers className="w-3.5 h-3.5 text-[#203A65]" />
                <span>Salas, laboratórios e instalações deste bloco:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredRooms.map((room) => {
                  const isRoomActive = activeRoomCode === room.code;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setActiveRoomCode(room.code)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isRoomActive
                          ? 'bg-white border-[#203A65] shadow-xs ring-2 ring-[#203A65]/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{room.code}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{room.floor}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{room.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">Capacidade: {room.capacity} alunos</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* PAINEL DE ROTA PASSO A PASSO (QUANDO EXPANDIDO)                    */}
          {/* =================================================================== */}
          {isRouteOpen && (
            <div className="bg-white border-2 border-[#203A65] rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#203A65] text-white flex items-center justify-center font-bold">
                    <Footprints className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      Rota Guiada Passo a Passo: {activeRoomCode}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Origem: {currentBuilding.gate} → Destino: {currentBuilding.name}
                    </p>
                  </div>
                </div>

                {/* Alternador de Elevador / Escadas */}
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setPreferElevator(true)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      preferElevator
                        ? 'bg-[#203A65] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Elevador (Acessível)
                  </button>
                  <button
                    onClick={() => setPreferElevator(false)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      !preferElevator
                        ? 'bg-[#203A65] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Escadas
                  </button>
                </div>
              </div>

              {/* Etapas Sequenciais */}
              <div className="space-y-3">
                {routeSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#203A65] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <strong className="text-slate-900 font-bold block">{step.title}</strong>
                      <p className="text-slate-600 leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AVISO OBRIGATÓRIO: DEMONSTRAÇÃO ESQUEMÁTICA */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Aviso sobre o mapa e rotas:</strong>
                  <p className="mt-0.5 leading-relaxed">
                    Demonstração esquemática do campus Folium. Em breve integrado ao projeto CAD/BIM oficial da reitoria com plantas baixas de alta precisão.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* RODAPÉ DO MODAL COM BOTÕES DE AÇÃO                                    */}
        {/* ===================================================================== */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Folium Campus Guide • Conhecimento em cada etapa
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRouteOpen(!isRouteOpen)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#EAF0F7] text-[#203A65] hover:bg-[#dce6f2] cursor-pointer transition-colors"
            >
              {isRouteOpen ? 'Ocultar Rota' : 'Ver Instruções da Rota'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#203A65] text-white hover:bg-[#182C4F] cursor-pointer transition-colors shadow-xs"
            >
              Concluir Consulta
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MODAL SECUNDÁRIO: SIMULAÇÃO DA GESTÃO ACADÊMICA (ALTERAÇÃO DE SALA)    */}
      {/* ======================================================================= */}
      {isAdminOverrideOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-[#203A65]">
                <SlidersHorizontal className="w-5 h-5 text-[#203A65]" />
                <h3 className="font-bold text-base">Gestão Acadêmica — Alteração de Sala</h3>
              </div>
              <button
                onClick={() => setIsAdminOverrideOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Cadastre uma alteração temporária ou emergencial de sala para uma data específica. A nova sala terá precedência sobre a grade regular e será destacada aos alunos.
            </p>

            <form onSubmit={handleCreateOverride} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Data da alteração:</label>
                <input
                  type="date"
                  value={adminTargetDate}
                  onChange={(e) => setAdminTargetDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disciplina curricular:</label>
                <select
                  value={adminDisciplineId}
                  onChange={(e) => setAdminDisciplineId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none cursor-pointer"
                >
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Novo Prédio / Bloco:</label>
                  <select
                    value={adminNewBuildingId}
                    onChange={(e) => setAdminNewBuildingId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {campusBuildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nova Sala:</label>
                  <input
                    type="text"
                    value={adminNewRoom}
                    onChange={(e) => setAdminNewRoom(e.target.value)}
                    placeholder="Ex: Sala 102 — Bloco C"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo comunicado aos discentes:</label>
                <textarea
                  rows={2}
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="Ex: Manutenção técnica preventiva nos computadores."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Lista de Alterações Ativas com botão de exclusão */}
              {scheduleOverrides.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-[11px] text-slate-700 block mb-1.5">
                    Alterações ativas cadastradas:
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {scheduleOverrides.map((o) => (
                      <div
                        key={o.id}
                        className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <strong className="text-amber-900">{o.disciplineName} ({o.date})</strong>
                          <span className="text-amber-800 block text-[10px]">Para: {o.newRoom}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScheduleOverride(o.id)}
                          className="p-1 text-red-600 hover:text-red-800 rounded cursor-pointer"
                          title="Remover alteração"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdminOverrideOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#203A65] text-white font-bold hover:bg-[#182C4F] cursor-pointer shadow-xs"
                >
                  Salvar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
