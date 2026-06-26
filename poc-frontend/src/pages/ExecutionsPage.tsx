import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getExecutions, cancelExecution } from '../api/executionApi';
import { getAllFlux } from '../api/fluxApi';
import { Execution, ExecutionStatus, Flux } from '../types';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

const ExecutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFluxId, setFilterFluxId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getExecutions({
      page,
      size: 10,
      status: filterStatus || undefined,
      fluxId: filterFluxId ? Number(filterFluxId) : undefined,
    })
      .then(data => { setExecutions(data.content); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [page, filterStatus, filterFluxId]);

  useEffect(() => {
    getAllFlux(0, 100).then(d => setFluxList(d.content)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (ex: Execution) => {
    try {
      await cancelExecution(ex.id);
      toast.success('Exécution annulée');
      load();
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const statuses: ExecutionStatus[] = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'ARCHIVED'];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1F4E79', fontSize: '26px', marginBottom: '24px' }}>Historique des Exécutions</h1>

      {/* Filtres */}
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px',
        display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Statut</label>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', minWidth: '160px' }}
          >
            <option value="">Tous les statuts</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Flux</label>
          <select
            value={filterFluxId}
            onChange={e => { setFilterFluxId(e.target.value); setPage(0); }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', minWidth: '200px' }}
          >
            <option value="">Tous les flux</option>
            {fluxList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setFilterStatus(''); setFilterFluxId(''); setPage(0); }}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
        >
          Réinitialiser
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F4E79' }}>
                  {['#', 'Flux', 'Statut', 'Début', 'Durée', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {executions.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Aucune exécution trouvée</td></tr>
                ) : executions.map((ex, i) => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#888' }}>#{ex.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F4E79', fontSize: '14px' }}>{ex.fluxName}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={ex.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{formatDate(ex.startedAt)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#555' }}>{formatDuration(ex.durationMs)}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/executions/${ex.id}`)}
                        style={{ padding: '5px 12px', borderRadius: '5px', border: 'none', background: '#2E75B6', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, marginRight: '6px' }}
                      >
                        Détail
                      </button>
                      {(ex.status === 'RUNNING' || ex.status === 'PENDING') && (
                        <button
                          onClick={() => handleCancel(ex)}
                          style={{ padding: '5px 12px', borderRadius: '5px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #2E75B6', background: page === 0 ? '#f0f0f0' : '#fff', color: '#2E75B6', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                ← Précédent
              </button>
              <span style={{ color: '#555', fontSize: '14px' }}>Page {page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #2E75B6', background: page >= totalPages - 1 ? '#f0f0f0' : '#fff', color: '#2E75B6', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExecutionsPage;
