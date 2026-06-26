import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllFlux } from '../api/fluxApi';
import { getExecutions } from '../api/executionApi';
import { Flux, Execution } from '../types';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: '10px',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  flex: 1,
};

const kpiValue: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 700,
  color: '#1F4E79',
  margin: '8px 0 4px',
};

const kpiLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

const DashboardPage: React.FC = () => {
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllFlux(0, 100), getExecutions({ size: 200 })])
      .then(([f, e]) => {
        setFluxList(f.content);
        setExecutions(e.content);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const activeFlux = fluxList.filter(f => f.status === 'ACTIVE').length;
  const successCount = executions.filter(e => e.status === 'SUCCESS').length;
  const successRate = executions.length > 0 ? Math.round((successCount / executions.length) * 100) : 0;
  const last5 = [...executions].sort((a, b) =>
    new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
  ).slice(0, 5);

  // Build chart data: group by day
  const byDay: Record<string, { date: string; SUCCESS: number; FAILED: number; RUNNING: number }> = {};
  executions.forEach(e => {
    const day = e.startedAt ? e.startedAt.split('T')[0] : 'Inconnu';
    if (!byDay[day]) byDay[day] = { date: day, SUCCESS: 0, FAILED: 0, RUNNING: 0 };
    if (e.status === 'SUCCESS') byDay[day].SUCCESS++;
    else if (e.status === 'FAILED') byDay[day].FAILED++;
    else byDay[day].RUNNING++;
  });
  const chartData = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1F4E79', marginBottom: '32px', fontSize: '26px' }}>Tableau de bord</h1>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={card}>
          <div style={kpiLabel}>Total Flux</div>
          <div style={kpiValue}>{fluxList.length}</div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>Flux Actifs</div>
          <div style={{ ...kpiValue, color: '#28a745' }}>{activeFlux}</div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>Total Exécutions</div>
          <div style={kpiValue}>{executions.length}</div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>Taux de Succès</div>
          <div style={{ ...kpiValue, color: successRate >= 80 ? '#28a745' : '#dc3545' }}>{successRate}%</div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ ...card, marginBottom: '32px' }}>
        <h2 style={{ color: '#1F4E79', fontSize: '16px', marginBottom: '20px' }}>Évolution des exécutions</h2>
        {chartData.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '32px' }}>Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="SUCCESS" stroke="#28a745" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="FAILED" stroke="#dc3545" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="RUNNING" stroke="#fd7e14" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Last executions */}
      <div style={card}>
        <h2 style={{ color: '#1F4E79', fontSize: '16px', marginBottom: '20px' }}>5 dernières exécutions</h2>
        {last5.length === 0 ? (
          <p style={{ color: '#888' }}>Aucune exécution</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F2F2F2' }}>
                {['Flux', 'Statut', 'Durée', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {last5.map(ex => (
                <tr key={ex.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px', fontSize: '14px' }}>{ex.fluxName}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={ex.status} /></td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', color: '#555' }}>{formatDuration(ex.durationMs)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: '#777' }}>{formatDate(ex.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
