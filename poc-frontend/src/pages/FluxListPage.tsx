import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllFlux, deleteFlux, activateFlux, deactivateFlux } from '../api/fluxApi';
import { triggerExecution } from '../api/executionApi';
import { Flux } from '../types';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const btn = (color: string, bg: string): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: '5px', border: 'none',
  background: bg, color, cursor: 'pointer', fontSize: '12px', fontWeight: 600,
  marginRight: '6px', transition: 'opacity 0.2s',
});

const FluxListPage: React.FC = () => {
  const navigate = useNavigate();
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Flux | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getAllFlux(page, 10)
      .then(data => { setFluxList(data.content); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Erreur lors du chargement des flux'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (flux: Flux) => {
    try {
      if (flux.status === 'ACTIVE') {
        await deactivateFlux(flux.id);
        toast.success(`Flux "${flux.name}" désactivé`);
      } else {
        await activateFlux(flux.id);
        toast.success(`Flux "${flux.name}" activé`);
      }
      load();
    } catch {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleExecute = async (flux: Flux) => {
    try {
      await triggerExecution(flux.id);
      toast.success(`Exécution lancée pour "${flux.name}"`);
    } catch {
      toast.error('Erreur lors du déclenchement de l\'exécution');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFlux(deleteTarget.id);
      toast.success(`Flux "${deleteTarget.name}" supprimé`);
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ color: '#1F4E79', fontSize: '26px', margin: 0 }}>Gestion des Flux</h1>
        <button
          onClick={() => navigate('/flux/new')}
          style={{
            padding: '10px 22px', background: '#2E75B6', color: '#fff',
            border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
          }}
        >
          + Nouveau flux
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1F4E79' }}>
                  {['Nom', 'Description', 'Connecteur', 'Format', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: '13px', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fluxList.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Aucun flux trouvé</td></tr>
                ) : fluxList.map((flux, i) => (
                  <tr key={flux.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F4E79', fontSize: '14px' }}>{flux.name}</td>
                    <td style={{ padding: '12px 16px', color: '#666', fontSize: '13px', maxWidth: '200px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {flux.description || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{flux.connectorType}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{flux.outputFormat}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={flux.status} /></td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleToggle(flux)}
                        style={btn('#fff', flux.status === 'ACTIVE' ? '#6c757d' : '#28a745')}
                        title={flux.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                      >
                        {flux.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => handleExecute(flux)}
                        style={btn('#fff', '#2E75B6')}
                        title="Exécuter"
                        disabled={flux.status !== 'ACTIVE'}
                      >
                        ▶ Exécuter
                      </button>
                      <button
                        onClick={() => navigate(`/flux/${flux.id}/edit`)}
                        style={btn('#fff', '#fd7e14')}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteTarget(flux)}
                        style={btn('#fff', '#dc3545')}
                      >
                        Supprimer
                      </button>
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
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: '1px solid #2E75B6',
                  background: page === 0 ? '#f0f0f0' : '#fff', color: '#2E75B6',
                  cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 600,
                }}
              >
                ← Précédent
              </button>
              <span style={{ color: '#555', fontSize: '14px' }}>Page {page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '8px 18px', borderRadius: '6px', border: '1px solid #2E75B6',
                  background: page >= totalPages - 1 ? '#f0f0f0' : '#fff', color: '#2E75B6',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 600,
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Supprimer le flux"
          message={`Êtes-vous sûr de vouloir supprimer le flux "${deleteTarget.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default FluxListPage;
