import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Compass,
  Layers,
  Search,
  X,
  Footprints,
  Accessibility,
  Info,
  Calendar,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Navigation,
  SlidersHorizontal,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { CampusMap3D } from '../components/CampusMap3D';
import { CampusBuilding, CampusRoom, ResolvedClassSession } from '../types';
import { generateRouteSteps, CAMPUS_ENTRANCES } from '../data/campusData';

export const CampusMapView: React.FC = () => {
  const {
    campusBuildings,
    campusRooms,
    scheduleOverrides,
    getClassesForDate,
    targetBuildingIdForMap,
    setTargetBuildingIdForMap,
    targetRoomForMap,
    setTargetRoomForMap,
    targetSessionForMap,
    setTargetSessionForMap,
    targetDateForMap,
    setTargetDateForMap,
    setActiveView,
    disciplines,
  } = useEdu();

  // Local date for schedule lookups (defaults to targetDateForMap or today)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(targetDateForMap || todayStr);

  // View mode: '3d' or 'list'
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');

  // Currently selected building ID
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(
    targetBuildingIdForMap || 'bloco-a'
  );

  // Active room code
  const [activeRoomCode, setActiveRoomCode] = useState<string>(
    targetRoomForMap || 'Sala 204'
  );

  // Active class session (if user arrived via "Ver rota" on a class)
  const [currentSession, setCurrentSession] = useState<ResolvedClassSession | null>(
    targetSessionForMap || null
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Route preferences
  const [preferElevator, setPreferElevator] = useState<boolean>(true);
  const [isRouteExpanded, setIsRouteExpanded] = useState<boolean>(true);

  // Update when targetBuildingIdForMap changes externally
  useEffect(() => {
    if (targetBuildingIdForMap) {
      setSelectedBuildingId(targetBuildingIdForMap);
    }
  }, [targetBuildingIdForMap]);

  useEffect(() => {
    if (targetRoomForMap) {
      setActiveRoomCode(targetRoomForMap);
    }
  }, [targetRoomForMap]);

  useEffect(() => {
    if (targetSessionForMap) {
      setCurrentSession(targetSessionForMap);
    }
  }, [targetSessionForMap]);

  // Today's classes for the active date
  const classesForSelectedDate = useMemo(() => {
    return getClassesForDate(selectedDate);
  }, [getClassesForDate, selectedDate]);

  // Current selected building
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

  // Search filter
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

  // Category filter for rooms
  const filteredRooms = useMemo(() => {
    if (activeCategory === 'all') return buildingRooms;
    if (activeCategory === 'labs') return buildingRooms.filter((r) => r.type === 'laboratorio');
    if (activeCategory === 'theory') return buildingRooms.filter((r) => r.type === 'sala_teorica');
    if (activeCategory === 'study') return buildingRooms.filter((r) => r.type === 'biblioteca');
    return buildingRooms;
  }, [buildingRooms, activeCategory]);

  // Sequential route steps
  const routeSteps = useMemo(() => {
    return generateRouteSteps(currentBuilding, activeRoomCode, preferElevator);
  }, [currentBuilding, activeRoomCode, preferElevator]);

  const handleSelectBuilding = (bId: string) => {
    setSelectedBuildingId(bId);
    setTargetBuildingIdForMap(bId);
    // Find first room in this building as default
    const rooms = campusRooms.filter((r) => r.buildingId === bId);
    if (rooms.length > 0) {
      setActiveRoomCode(rooms[0].code);
      setTargetRoomForMap(rooms[0].code);
    }
  };

  const handleSelectClass = (cls: ResolvedClassSession) => {
    setCurrentSession(cls);
    setSelectedBuildingId(cls.buildingId);
    setActiveRoomCode(cls.room);
    setTargetBuildingIdForMap(cls.buildingId);
    setTargetRoomForMap(cls.room);
    setTargetSessionForMap(cls);
  };

  const handleClearDestinationSession = () => {
    setCurrentSession(null);
    setTargetSessionForMap(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & NAVIGATION BAR                                        */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-[#EAF0F7] text-slate-700 hover:text-[#203A65] cursor-pointer transition-colors border border-slate-200"
            title="Voltar ao Dashboard"
            aria-label="Voltar para a página inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-[#203A65] uppercase tracking-wider">
                Navegação Acadêmica
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF0F7] text-[#203A65]">
                Campus 3D
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#203A65] tracking-tight">
              Mapa e Localização do Campus
            </h1>
          </div>
        </div>

        {/* View Mode & Date Selection */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Seletor de Data da Grade */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-[#203A65]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              aria-label="Data da grade de aulas"
            />
          </div>

          {/* Alternador 3D / Lista Acessível */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200/70">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-white text-[#203A65] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa 3D</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#203A65] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Lista Acessível</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. BARRA DE PESQUISA RÁPIDA & AULAS DO DIA                            */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar bloco (BL-A, BL-B, BCU), sala (204, 302, 105), laboratório ou biblioteca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#203A65]/30 text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Resultados de Busca se houver texto digitado */}
        {searchResults && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Resultados encontrados ({searchResults.matchedBuildings.length + searchResults.matchedRooms.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {searchResults.matchedRooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    handleSelectBuilding(r.buildingId);
                    setActiveRoomCode(r.code);
                    setSearchQuery('');
                  }}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#203A65] text-left text-xs flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <strong className="text-slate-900 group-hover:text-[#203A65] font-bold truncate block">
                      {r.code} — {r.name}
                    </strong>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">{r.floor}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#203A65] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chips de Aulas da Data Selecionada */}
        <div>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#203A65]" />
              <span>Aulas programadas para esta data ({classesForSelectedDate.length}):</span>
            </span>
            <span className="text-[11px] text-slate-500">Turma A — Engenharia da Computação</span>
          </div>

          {classesForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {classesForSelectedDate.map((cls) => {
                const isSelected = activeRoomCode === cls.room;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAF0F7] border-[#203A65] ring-2 ring-[#203A65]/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-white text-slate-700 rounded border border-slate-200">
                        {cls.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{cls.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{cls.disciplineName}</h4>
                    <div className="flex items-center space-x-1 text-xs text-[#203A65] font-semibold mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{cls.room}</span>
                    </div>

                    {cls.isOverride && (
                      <span className="inline-block mt-1 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        ⚠️ Sala alterada pela coordenação
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
              Nenhuma aula cadastrada para esta data. Explore o campus, laboratórios e biblioteca abaixo.
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. ÁREA PRINCIPAL: MAPA 3D (ESQUERDA) + PAINEL DE DESTINO (DIREITA)   */}
      {/* ===================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUNA ESQUERDA: MAPA 3D OU LISTA ACESSÍVEL */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {viewMode === '3d' ? (
            <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
              <CampusMap3D
                buildings={campusBuildings}
                selectedBuildingId={selectedBuildingId}
                onSelectBuilding={handleSelectBuilding}
                targetRoom={activeRoomCode}
                className="w-full h-[380px] sm:h-[460px] lg:h-[540px]"
              />

              {/* Seletor rápido de prédios logo abaixo do canvas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {campusBuildings.map((b) => {
                  const isSelected = b.id === selectedBuildingId;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBuilding(b.id)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#203A65] text-white border-[#203A65] font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className={`font-mono text-[9px] block mb-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {b.code}
                      </div>
                      <span className="truncate block font-semibold text-[11px]">{b.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LISTA ACESSÍVEL DE PRÉDIOS E SALAS */
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-[#203A65]" />
                  <span>Instalações e Edifícios do Campus</span>
                </h3>
                <span className="text-xs text-slate-500">Visualização Acessível Alternativa</span>
              </div>

              <div className="space-y-3">
                {campusBuildings.map((b) => {
                  const isSelected = b.id === selectedBuildingId;
                  const rooms = campusRooms.filter((r) => r.buildingId === b.id);

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-[#EAF0F7]/80 border-[#203A65] ring-2 ring-[#203A65]/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#203A65] text-white">
                              {b.code}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900">{b.name}</h4>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{b.directions}</p>
                          <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                            <span>Entrada: <strong>{b.gate}</strong></span>
                            <span>•</span>
                            <span>Pavimentos: <strong>{b.floorsDesc}</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectBuilding(b.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#203A65] text-white'
                              : 'bg-white hover:bg-slate-100 text-[#203A65] border border-slate-200'
                          }`}
                        >
                          {isSelected ? 'Prédio Selecionado' : 'Selecionar'}
                        </button>
                      </div>

                      {/* Lista de salas deste bloco */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                        {rooms.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              handleSelectBuilding(b.id);
                              setActiveRoomCode(r.code);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                              activeRoomCode === r.code && isSelected
                                ? 'bg-[#203A65] text-white border-[#203A65]'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <strong>{r.code}</strong> — {r.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: PAINEL DE DESTINO, ROTA E ACESSO */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {/* Card de Destino Ativo */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#203A65] shadow-md space-y-4">
            {/* Header com Badge de Destino */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#203A65] uppercase tracking-wider block mb-1">
                  Destino Selecionado
                </span>
                <h3 className="text-lg font-extrabold text-[#203A65] flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#203A65] shrink-0" />
                  <span>{currentBuilding.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{currentBuilding.floorsDesc}</p>
              </div>

              <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-[#203A65] text-white shrink-0">
                {currentBuilding.code}
              </span>
            </div>

            {/* Informações da Aula Vinculada (se o acesso veio de uma aula) */}
            {currentSession && (
              <div className="p-3.5 rounded-2xl bg-[#EAF0F7] border border-[#203A65]/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#203A65] uppercase tracking-wider">
                    Aula em Andamento / Próxima
                  </span>
                  <button
                    onClick={handleClearDestinationSession}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Desvincular aula do painel"
                  >
                    Desvincular
                  </button>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{currentSession.disciplineName}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold">{currentSession.time}</span>
                  <span>•</span>
                  <span className="truncate">{currentSession.instructor}</span>
                </div>

                {currentSession.isOverride && (
                  <div className="mt-1.5 p-2 rounded-lg bg-amber-50 border border-amber-300 text-[10px] text-amber-900">
                    <strong className="block font-bold">⚠️ Alteração Excepcional da Gestão:</strong>
                    <span>{currentSession.overrideReason || 'Aula realocada preventivamente pela coordenação.'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sala, Andar e Entrada */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">SALA & ANDAR</span>
                <strong className="text-slate-900 font-bold block">{activeRoomCode}</strong>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  {currentBuilding.floorsDesc.split('(')[0]}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">PORTÃO DE ENTRADA</span>
                <strong className="text-slate-900 font-bold block">{currentBuilding.gate}</strong>
                <span className="text-slate-500 text-[11px] block mt-0.5">Acesso recomendado</span>
              </div>
            </div>

            {/* Instruções de Percurso Interno */}
            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#203A65]" />
                <span>Instruções de acesso e circulação:</span>
              </span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 leading-relaxed text-xs">
                {currentBuilding.directions}
              </p>
            </div>

            {/* Rota Sequencial Passo a Passo */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Footprints className="w-4 h-4 text-[#203A65]" />
                  <span>Trajeto sequencial detalhado:</span>
                </span>

                {/* Alternador de Elevador / Escadas */}
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                  <button
                    onClick={() => setPreferElevator(true)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      preferElevator ? 'bg-[#203A65] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Elevador
                  </button>
                  <button
                    onClick={() => setPreferElevator(false)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      !preferElevator ? 'bg-[#203A65] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Escadas
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {routeSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#203A65] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {step.stepNumber}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-slate-900 font-bold block">{step.title}</strong>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AVISO OBRIGATÓRIO: NAVEGAÇÃO DEMONSTRATIVA */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Aviso sobre o modelo 3D:</strong>
                <p className="mt-0.5 leading-relaxed">
                  Demonstração esquemática do campus Folium. Em breve integrado ao projeto CAD/BIM da reitoria com plantas e geolocalização precisa.
                </p>
              </div>
            </div>

            {/* Botão de Retorno ao Dashboard */}
            <div className="pt-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className="w-full py-2.5 rounded-xl bg-[#203A65] hover:bg-[#182C4F] text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retornar ao Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
