import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getExecutionById, getExecutionLogs, downloadFile } from '../api/executionApi';
import { Execution, ExecutionLog } from '../types';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

const logLevelColor: Record<string, string> = {
  INFO: '#2E75B6',
  WARN: '#fd7e14',
  ERROR: '#dc3545',
};

const infoRow = (label: string, value: React.ReactNode) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
    <span style={{ width: '140px', fontSize: '13px', color: '#888', fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '14px', color: '#333' }}>{value}</span>
  </div>
);

const ExecutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    setLoading(true);
    Promise.all([getExecutionById(numId), getExecutionLogs(numId)])
      .then(([ex, lg]) => { setExecution(ex); setLogs(lg); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    try {
      const blob = await downloadFile(Number(id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `execution_${id}_output`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!execution) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Exécution introuvable</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => navigate('/executions')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2E75B6', fontSize: '22px' }}
        >←</button>
        <h1 style={{ color: '#1F4E79', fontSize: '24px', margin: 0 }}>
          Détail de l'exécution #{id}
        </h1>
      </div>

      {/* Info card */}
      <div style={{
        background: '#fff', borderRadius: '10px', padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#555', fontWeight: 600 }}>Informations</h2>
          {execution.outputFilePath && (
            <button
              onClick={handleDownload}
              style={{
                padding: '8px 18px', borderRadius: '7px', border: 'none',
                background: '#1F4E79', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              }}
            >
              ↓ Télécharger le fichier
            </button>
          )}
        </div>
        {infoRow('Flux', <strong>{execution.fluxName}</strong>)}
        {infoRow('Statut', <StatusBadge status={execution.status} />)}
        {infoRow('Début', formatDate(execution.startedAt))}
        {infoRow('Fin', formatDate(execution.finishedAt))}
        {infoRow('Durée', formatDuration(execution.durationMs))}
        {infoRow('Fichier généré', execution.outputFilePath || <span style={{ color: '#bbb' }}>Aucun</span>)}
        {execution.errorMessage && infoRow('Erreur', (
          <span style={{ color: '#dc3545', fontSize: '13px', fontFamily: 'monospace', background: '#fff0f0', padding: '4px 8px', borderRadius: '4px' }}>
            {execution.errorMessage}
          </span>
        ))}
      </div>

      {/* Logs */}
      <div style={{ background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '16px', color: '#555', fontWeight: 600 }}>
          Logs ({logs.length})
        </h2>
        {logs.length === 0 ? (
          <p style={{ color: '#bbb', textAlign: 'center', padding: '20px' }}>Aucun log disponible</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F2F2F2' }}>
                  {['Horodatage', 'Étape', 'Niveau', 'Message'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: '#555', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '9px 14px', color: '#777', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {new Date(log.loggedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '9px 14px', color: '#888', whiteSpace: 'nowrap' }}>{log.step || '-'}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        color: logLevelColor[log.level] || '#555',
                        fontWeight: 700, fontSize: '11px',
                        background: `${logLevelColor[log.level]}18`,
                        padding: '2px 8px', borderRadius: '10px',
                      }}>
                        {log.level}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', color: '#333', fontFamily: 'monospace', wordBreak: 'break-all' }}>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionDetailPage;
