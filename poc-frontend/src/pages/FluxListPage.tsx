import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box, Toolbar, Button, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Link, Skeleton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllFlux, deleteFlux, activateFlux, deactivateFlux } from '../api/fluxApi';
import { triggerExecution } from '../api/executionApi';
import { isAuthError } from '../api/axiosConfig';
import { Flux } from '../types';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const FluxListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [fluxList, setFluxList] = useState<Flux[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Flux | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const notify = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity });

  const load = useCallback(() => {
    setLoading(true);
    getAllFlux(paginationModel.page, paginationModel.pageSize)
      .then(data => { setFluxList(data.content); setRowCount(data.totalElements); })
      .catch(error => { if (!isAuthError(error)) notify('Erreur lors du chargement des flux', 'error'); })
      .finally(() => setLoading(false));
  }, [paginationModel]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (flux: Flux) => {
    try {
      if (flux.status === 'ACTIVE') {
        await deactivateFlux(flux.id);
        notify(`Flux "${flux.name}" désactivé`, 'success');
      } else {
        await activateFlux(flux.id);
        notify(`Flux "${flux.name}" activé`, 'success');
      }
      load();
    } catch {
      notify('Erreur lors du changement de statut', 'error');
    }
  };

  const handleExecute = async (flux: Flux) => {
    try {
      await triggerExecution(flux.id);
      notify(`Exécution lancée pour "${flux.name}"`, 'success');
    } catch {
      notify("Erreur lors du déclenchement de l'exécution", 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFlux(deleteTarget.id);
      notify(`Flux "${deleteTarget.name}" supprimé`, 'success');
      setDeleteTarget(null);
      load();
    } catch {
      notify('Erreur lors de la suppression', 'error');
    }
  };

  const columns: GridColDef<Flux>[] = [
    {
      field: 'name', headerName: 'Nom', flex: 1, minWidth: 160,
      renderCell: (params: GridRenderCellParams<Flux>) => (
        <Link
          component="button"
          underline="hover"
          sx={{ fontWeight: 600, color: '#1F4E79' }}
          onClick={() => navigate(`/flux/${params.row.id}/edit`)}
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'description', headerName: 'Description', flex: 1.2, minWidth: 180, valueGetter: (value) => value || '-' },
    { field: 'connectorType', headerName: 'Connecteur', width: 130 },
    { field: 'outputFormat', headerName: 'Format', width: 100 },
    {
      field: 'status', headerName: 'Statut', width: 120,
      renderCell: (params: GridRenderCellParams<Flux>) => <StatusBadge status={params.row.status} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 170, sortable: false, filterable: false,
      renderCell: (params: GridRenderCellParams<Flux>) => {
        const flux = params.row;
        return (
          <Box>
            {flux.status !== 'INACTIVE' && (
              <Tooltip title="Exécuter">
                <IconButton size="small" color="primary" onClick={() => handleExecute(flux)}>
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isAdmin() && (
              <Tooltip title="Modifier">
                <IconButton size="small" onClick={() => navigate(`/flux/${flux.id}/edit`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={flux.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}>
              <IconButton size="small" color={flux.status === 'ACTIVE' ? 'default' : 'success'} onClick={() => handleToggle(flux)}>
                <PowerSettingsNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {isAdmin() && (
              <Tooltip title="Supprimer">
                <IconButton size="small" color="error" onClick={() => setDeleteTarget(flux)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
    <Box sx={{ padding: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Toolbar disableGutters sx={{ mb: 3, justifyContent: 'flex-end' }}>
        {isAdmin() && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/flux/new')}>
            Nouveau flux
          </Button>
        )}
      </Toolbar>

      {loading && fluxList.length === 0 ? (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', p: 2 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rectangular" height={52} animation="wave" sx={{ borderRadius: 1, mb: 1 }} />
          ))}
        </Box>
      ) : (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: 560 }}>
          <DataGrid
            rows={fluxList}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{ border: 'none' }}
          />
        </Box>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Supprimer le flux</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le flux « {deleteTarget?.name} » ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
    </motion.div>
  );
};

export default FluxListPage;
