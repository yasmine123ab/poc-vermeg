import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box, Typography, Card, CardContent, TextField, MenuItem, Button,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Paper, Pagination, Stack, Skeleton,
} from '@mui/material';
import { getExecutions, cancelExecution } from '../api/executionApi';
import { getAllFlux } from '../api/fluxApi';
import { isAuthError } from '../api/axiosConfig';
import { useWebSocket, ExecutionUpdate } from '../hooks/useWebSocket';
import { Execution, ExecutionStatus, Flux } from '../types';
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

const statuses: ExecutionStatus[] = ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'ARCHIVED'];

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
      .catch(error => { if (!isAuthError(error)) toast.error('Erreur de chargement'); })
      .finally(() => setLoading(false));
  }, [page, filterStatus, filterFluxId]);

  useEffect(() => {
    getAllFlux(0, 100).then(d => setFluxList(d.content)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  useWebSocket((update: ExecutionUpdate) => {
    setExecutions(prev => {
      const exists = prev.find(e => e.id === update.executionId);
      if (exists) {
        return prev.map(e => e.id === update.executionId ? {
          ...e,
          status: update.status as ExecutionStatus,
          finishedAt: update.finishedAt,
          durationMs: update.durationMs,
          outputFilePath: update.outputFilePath,
          errorMessage: update.errorMessage,
        } : e);
      }
      return prev;
    });
  });

  const handleCancel = async (ex: Execution) => {
    try {
      await cancelExecution(ex.id);
      toast.success('Exécution annulée');
      load();
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleReset = () => {
    setFilterStatus('');
    setFilterFluxId('');
    setPage(0);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700, mb: 3 }}>
        Historique des Exécutions
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              select label="Statut" size="small" sx={{ minWidth: 180 }}
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
              select label="Flux" size="small" sx={{ minWidth: 220 }}
              value={filterFluxId}
              onChange={e => { setFilterFluxId(e.target.value); setPage(0); }}
            >
              <MenuItem value="">Tous les flux</MenuItem>
              {fluxList.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
            </TextField>
            <Button variant="outlined" onClick={handleReset}>Réinitialiser</Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', p: 2 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rectangular" height={52} animation="wave" sx={{ borderRadius: 1, mb: 1 }} />
          ))}
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#1F4E79' }}>
                  {['#', 'Flux', 'Statut', 'Début', 'Durée', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {executions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#888', py: 5 }}>
                      Aucune exécution trouvée
                    </TableCell>
                  </TableRow>
                ) : executions.map(ex => (
                  <TableRow key={ex.id} hover>
                    <TableCell sx={{ color: '#888' }}>#{ex.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1F4E79' }}>{ex.fluxName}</TableCell>
                    <TableCell><StatusBadge status={ex.status} /></TableCell>
                    <TableCell sx={{ color: '#666' }}>{formatDate(ex.startedAt)}</TableCell>
                    <TableCell sx={{ color: '#555' }}>{formatDuration(ex.durationMs)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => navigate(`/executions/${ex.id}`)}>
                          Détail
                        </Button>
                        {(ex.status === 'RUNNING' || ex.status === 'PENDING') && (
                          <Button size="small" variant="contained" color="error" onClick={() => handleCancel(ex)}>
                            Annuler
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => setPage(value - 1)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
    </motion.div>
  );
};

export default ExecutionsPage;
