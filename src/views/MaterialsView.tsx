import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  BookOpen,
  Filter,
  Download,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useEdu } from '../context/EduContext';
import { StudyMaterial } from '../types';

export const MaterialsView: React.FC = () => {
  const { materials, disciplines } = useEdu();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  // Filtros combinados
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDiscipline =
        selectedDiscipline === 'Todas' || m.discipline === selectedDiscipline;

      const matchesType =
        selectedType === 'Todos' || m.type === selectedType;

      return matchesSearch && matchesDiscipline && matchesType;
    });
  }, [materials, searchQuery, selectedDiscipline, selectedType]);

  const disciplineNames = useMemo(() => {
    return Array.from(new Set(disciplines.map((d) => d.name))).sort();
  }, [disciplines]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo com Título e Esclarecimento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Materiais de Estudo & Referências
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Apostilas, artigos e notas de aula disponibilizados pelos docentes de cada disciplina.
          </p>
        </div>

        {/* Nota explicativa de permissão */}
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <Info className="w-4 h-4 text-[#203A65] shrink-0" />
          <span>Upload gerenciado pela equipe docente</span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar material ou tema..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#203A65] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Filtro por Disciplina */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
          >
            <option value="Todas">Todas as disciplinas</option>
            {disciplineNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Filtro por Formato */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#203A65] cursor-pointer"
          >
            <option value="Todos">Todos os tipos</option>
            <option value="PDF">Documentos PDF</option>
            <option value="Slide">Apresentações (Slides)</option>
            <option value="Link">Links & Artigos</option>
          </select>
        </div>
      </div>

      {/* Grade de Materiais */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Nenhum material encontrado</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Novos materiais de aula serão disponibilizados pelos professores conforme o andamento do semestre letivo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      mat.type === 'PDF'
                        ? 'bg-red-50 text-red-700'
                        : mat.type === 'Slide'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-[#EAF0F7] text-[#203A65]'
                    }`}
                  >
                    {mat.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{mat.fileSize || 'Online'}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                  {mat.title}
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#203A65] shrink-0" />
                  <span className="truncate">{mat.discipline}</span>
                </div>

                {mat.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {mat.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Adicionado em {mat.dateAdded}
                </span>

                <a
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#203A65] hover:underline bg-[#EAF0F7] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Abrir material oficial"
                >
                  <span>Acessar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
