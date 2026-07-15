import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Grid, TextField, MenuItem, Avatar, Stack,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Skeleton,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Area, Line, TooltipProps,
} from 'recharts';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import { getExecutions } from '../api/executionApi';
import { getAllFlux } from '../api/fluxApi';
import { isAuthError } from '../api/axiosConfig';
import { Execution, Flux } from '../types';
import StatusBadge from '../components/StatusBadge';
import CountUp from '../components/CountUp';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: '#28a745',
  FAILED: '#dc3545',
  CANCELLED: '#9e9e9e',
  PENDING: '#fd7e14',
};

const periods = [7, 14, 30, 90];

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
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
      <Box sx={{ overflow: 'hidden' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const EmptyState: React.FC = () => (
  <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>Aucune donnée disponible</Typography>
);

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, boxShadow: 3 }}>
      {label !== undefined && (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{label}</Typography>
      )}
      {payload.map(p => (
        <Typography key={p.dataKey} variant="body2" sx={{ color: p.color }}>
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

const StatsPage: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [fluxFilter, setFluxFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [e, f] = await Promise.all([getExecutions({ size: 500 }), getAllFlux(0, 100)]);
        setExecutions(e.content);
        setFluxList(f.content);
      } catch (error) {
        if (!isAuthError(error)) {
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - period);
    return executions.filter(e => {
      if (!e.startedAt || new Date(e.startedAt) < cutoff) return false;
      if (fluxFilter && String(e.fluxId) !== fluxFilter) return false;
      return true;
    });
  }, [executions, period, fluxFilter]);

  const totalExecutions = filtered.length;
  const successCount = filtered.filter(e => e.status === 'SUCCESS').length;
  const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100) : 0;
  const durations = filtered.map(e => e.durationMs).filter((d): d is number => d != null);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  const byFluxCount: Record<string, number> = {};
  filtered.forEach(e => { byFluxCount[e.fluxName] = (byFluxCount[e.fluxName] || 0) + 1; });
  const topFluxName = Object.entries(byFluxCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const byFluxStatus: Record<string, { name: string; SUCCESS: number; FAILED: number; CANCELLED: number }> = {};
  filtered.forEach(e => {
    if (!byFluxStatus[e.fluxName]) byFluxStatus[e.fluxName] = { name: e.fluxName, SUCCESS: 0, FAILED: 0, CANCELLED: 0 };
    if (e.status === 'SUCCESS') byFluxStatus[e.fluxName].SUCCESS++;
    else if (e.status === 'FAILED') byFluxStatus[e.fluxName].FAILED++;
    else if (e.status === 'CANCELLED') byFluxStatus[e.fluxName].CANCELLED++;
  });
  const barData = Object.values(byFluxStatus);

  const statusCounts: Record<string, number> = { SUCCESS: 0, FAILED: 0, CANCELLED: 0, PENDING: 0 };
  filtered.forEach(e => { if (statusCounts[e.status] !== undefined) statusCounts[e.status]++; });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  const byDay: Record<string, { date: string; SUCCESS: number; FAILED: number }> = {};
  filtered.forEach(e => {
    const day = e.startedAt!.split('T')[0];
    if (!byDay[day]) byDay[day] = { date: day, SUCCESS: 0, FAILED: 0 };
    if (e.status === 'SUCCESS') byDay[day].SUCCESS++;
    else if (e.status === 'FAILED') byDay[day].FAILED++;
  });
  const lineData = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));

  const top5 = [...filtered]
    .filter(e => e.durationMs != null)
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[0, 1, 2, 3].map(i => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} animation="wave" />
      </Box>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
      <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <TextField
                select label="Période" size="small" sx={{ minWidth: 160 }}
                value={period} onChange={e => setPeriod(Number(e.target.value))}
              >
                {periods.map(p => <MenuItem key={p} value={p}>{p} jours</MenuItem>)}
              </TextField>
              <TextField
                select label="Flux" size="small" sx={{ minWidth: 220 }}
                value={fluxFilter} onChange={e => setFluxFilter(e.target.value)}
              >
                <MenuItem value="">Tous les flux</MenuItem>
                {fluxList.map(f => <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>)}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total Exécutions" value={<CountUp value={totalExecutions} />} icon={<PlayCircleIcon />} color="#2E75B6" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Taux de succès" value={<CountUp value={successRate} suffix="%" />} icon={<TrendingUpIcon />} color="#28a745" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Durée moyenne" value={<CountUp value={avgDuration} suffix="ms" />} icon={<TimerIcon />} color="#fd7e14" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Flux le plus actif" value={topFluxName} icon={<StarIcon />} color="#9c27b0" />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>Exécutions par flux</Typography>
                {barData.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="SUCCESS" name="Succès" fill="#28a745" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="FAILED" name="Échec" fill="#dc3545" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="CANCELLED" name="Annulé" fill="#9e9e9e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>Répartition des statuts</Typography>
                {pieData.length === 0 ? <EmptyState /> : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {pieData.map(d => <Cell key={d.name} fill={STATUS_COLORS[d.name]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>Tendance sur la période</Typography>
            {lineData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={lineData}>
                  <defs>
                    <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#28a745" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#28a745" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="SUCCESS" name="Succès" stroke="#28a745" fill="url(#successGradient)" strokeWidth={2} />
                  <Line type="monotone" dataKey="FAILED" name="Échec" stroke="#dc3545" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '16px' }}>Top 5 exécutions les plus longues</Typography>
            {top5.length === 0 ? <EmptyState /> : (
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Flux</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Durée</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top5.map(ex => (
                      <TableRow key={ex.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{ex.fluxName}</TableCell>
                        <TableCell><StatusBadge status={ex.status} /></TableCell>
                        <TableCell>{formatDuration(ex.durationMs)}</TableCell>
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

export default StatsPage;
