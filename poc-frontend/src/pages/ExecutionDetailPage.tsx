import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, Typography, Breadcrumbs, Link, Grid, Alert,
  Button, IconButton, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { getExecutionById, getExecutionLogs, downloadFile } from '../api/executionApi';
import { isAuthError } from '../api/axiosConfig';
import { Execution, ExecutionLog } from '../types';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function formatDate(s?: string) {
  if (!s) return '-';
  return new Date(s).toLocaleString('fr-FR');
}

function formatDuration(ms?: number) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

const logLevelColor: Record<string, { bg: string; color: string }> = {
  INFO: { bg: '#e8f0fe', color: '#2E75B6' },
  WARN: { bg: '#fff3cd', color: '#fd7e14' },
  ERROR: { bg: '#f8d7da', color: '#dc3545' },
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Typography variant="caption" sx={{ color: '#888', fontWeight: 600, display: 'block' }}>
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ color: '#333' }}>
      {value}
    </Typography>
  </Grid>
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
      .catch(error => { if (!isAuthError(error)) toast.error('Erreur de chargement'); })
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
  if (!execution) return <Typography sx={{ p: 5, textAlign: 'center', color: '#888' }}>Exécution introuvable</Typography>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
    <Box sx={{ padding: 4, maxWidth: 1000, margin: '0 auto' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/executions" underline="hover" color="inherit">
          Exécutions
        </Link>
        <Typography color="text.primary">Exécution #{id}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/executions')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Détail de l'exécution #{id}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '16px', color: '#555', fontWeight: 700 }}>
              Informations
            </Typography>
            {execution.outputFilePath && (
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                Télécharger le fichier
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <InfoRow label="Flux" value={<strong>{execution.fluxName}</strong>} />
            <InfoRow label="Statut" value={<StatusBadge status={execution.status} />} />
            <InfoRow label="Début" value={formatDate(execution.startedAt)} />
            <InfoRow label="Fin" value={formatDate(execution.finishedAt)} />
            <InfoRow label="Durée" value={formatDuration(execution.durationMs)} />
            <InfoRow
              label="Fichier généré"
              value={execution.outputFilePath || <span style={{ color: '#bbb' }}>Aucun</span>}
            />
          </Grid>

          {execution.errorMessage && (
            <Alert severity="error" sx={{ mt: 2, fontFamily: 'monospace' }}>
              {execution.errorMessage}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontSize: '16px', color: '#555', fontWeight: 700, mb: 2 }}>
            Logs ({logs.length})
          </Typography>
          {logs.length === 0 ? (
            <Typography sx={{ color: '#bbb', textAlign: 'center', py: 3 }}>Aucun log disponible</Typography>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F2F2F2' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Horodatage</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Étape</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Niveau</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map(log => {
                    const lvl = logLevelColor[log.level] || { bg: '#eee', color: '#555' };
                    return (
                      <TableRow key={log.id}>
                        <TableCell sx={{ color: '#777', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {new Date(log.loggedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </TableCell>
                        <TableCell sx={{ color: '#888', whiteSpace: 'nowrap' }}>{log.step || '-'}</TableCell>
                        <TableCell>
                          <Chip label={log.level} size="small" sx={{ bgcolor: lvl.bg, color: lvl.color, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{log.message}</TableCell>
                      </TableRow>
                    );
                  })}
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

export default ExecutionDetailPage;
