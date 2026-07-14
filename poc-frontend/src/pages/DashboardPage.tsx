import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper, Avatar, Skeleton,
} from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getAllFlux } from '../api/fluxApi';
import { getExecutions } from '../api/executionApi';
import { isAuthError } from '../api/axiosConfig';
import { Flux, Execution } from '../types';
import StatusBadge from '../components/StatusBadge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
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

function isSameDay(dateStr: string | undefined, ref: Date) {
  if (!dateStr) return false;
  return new Date(dateStr).toDateString() === ref.toDateString();
}

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, color, trend }) => (
  <Card
    sx={{
      height: '100%',
      borderLeft: `4px solid ${color}`,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 8 },
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}22`, color, width: 52, height: 52 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </Typography>
        {trend !== undefined && (
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 0.5, fontWeight: 600, color: trend >= 0 ? '#28a745' : '#dc3545' }}
          >
            {trend >= 0 ? `+${trend}` : trend} depuis hier
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const DashboardSkeleton: React.FC = () => (
  <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[0, 1, 2, 3].map(i => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} animation="wave" />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4, mb: 4 }} animation="wave" />
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} animation="wave" />
  </Box>
);

const DashboardPage: React.FC = () => {
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, e] = await Promise.all([getAllFlux(0, 100), getExecutions({ size: 200 })]);
        setFluxList(f.content);
        setExecutions(e.content);
      } catch (error) {
        if (!isAuthError(error)) {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const activeFlux = fluxList.filter(f => f.status === 'ACTIVE').length;
  const successCount = executions.filter(e => e.status === 'SUCCESS').length;
  const successRate = executions.length > 0 ? Math.round((successCount / executions.length) * 100) : 0;
  const last10 = [...executions].sort((a, b) =>
    new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
  ).slice(0, 10);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fluxCreatedToday = fluxList.filter(f => isSameDay(f.createdAt, today)).length;
  const activeFluxYesterday = fluxList.filter(f => f.status === 'ACTIVE' && !isSameDay(f.createdAt, today)).length;
  const activeFluxTrend = activeFlux - activeFluxYesterday;

  const execToday = executions.filter(e => isSameDay(e.startedAt, today)).length;
  const execYesterday = executions.filter(e => isSameDay(e.startedAt, yesterday)).length;
  const execTrend = execToday - execYesterday;

  const successToday = executions.filter(e => isSameDay(e.startedAt, today) && e.status === 'SUCCESS').length;
  const successRateToday = execToday > 0 ? Math.round((successToday / execToday) * 100) : successRate;
  const successYesterday = executions.filter(e => isSameDay(e.startedAt, yesterday) && e.status === 'SUCCESS').length;
  const successRateYesterday = execYesterday > 0 ? Math.round((successYesterday / execYesterday) * 100) : successRate;
  const successRateTrend = successRateToday - successRateYesterday;

  const byDay: Record<string, { date: string; SUCCESS: number; FAILED: number; RUNNING: number }> = {};
  executions.forEach(e => {
    const day = e.startedAt ? e.startedAt.split('T')[0] : 'Inconnu';
    if (!byDay[day]) byDay[day] = { date: day, SUCCESS: 0, FAILED: 0, RUNNING: 0 };
    if (e.status === 'SUCCESS') byDay[day].SUCCESS++;
    else if (e.status === 'FAILED') byDay[day].FAILED++;
    else byDay[day].RUNNING++;
  });
  const chartData = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
      <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Total Flux" value={fluxList.length} icon={<AccountTreeIcon />} color="#2E75B6" trend={fluxCreatedToday} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Flux Actifs" value={activeFlux} icon={<CheckCircleIcon />} color="#28a745" trend={activeFluxTrend} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard label="Total Exécutions" value={executions.length} icon={<PlayCircleIcon />} color="#fd7e14" trend={execTrend} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              label="Taux de Succès"
              value={`${successRate}%`}
              icon={<TrendingUpIcon />}
              color={successRate > 50 ? '#28a745' : '#dc3545'}
              trend={successRateTrend}
            />
          </Grid>
        </Grid>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontSize: '16px' }}>
              Évolution des exécutions sur 30 jours
            </Typography>
            {chartData.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>Aucune donnée disponible</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="SUCCESS" name="Succès" stroke="#28a745" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="FAILED" name="Échec" stroke="#dc3545" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="RUNNING" name="En cours" stroke="#fd7e14" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontSize: '16px' }}>
              Dernières exécutions
            </Typography>
            {last10.length === 0 ? (
              <Typography sx={{ color: 'text.secondary' }}>Aucune exécution</Typography>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Flux</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Durée</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {last10.map(ex => (
                      <TableRow key={ex.id} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>#{ex.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{ex.fluxName}</TableCell>
                        <TableCell><StatusBadge status={ex.status} /></TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{formatDuration(ex.durationMs)}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>{formatDate(ex.startedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default DashboardPage;
