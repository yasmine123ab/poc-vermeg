import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, Stepper, Step, StepLabel, TextField, MenuItem,
  Button, Typography, Grid, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getFluxById, createFlux, updateFlux } from '../api/fluxApi';
import { ConnectorType, OutputFormat, RuleType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface Rule {
  orderIndex: number;
  ruleType: RuleType;
  sourceField: string;
  targetField: string;
  params?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const steps = ['Informations générales', 'Configuration connecteur', 'Règles de transformation'];
const connectorTypes: ConnectorType[] = ['DATABASE', 'REST_API', 'FILE', 'MESSAGE_QUEUE'];
const ruleTypes: RuleType[] = ['RENAME', 'FILTER', 'CAST', 'CONCAT', 'DERIVE'];

const FluxFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [connectorType, setConnectorType] = useState<ConnectorType>('DATABASE');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('JSON');
  const [connectorConfig, setConnectorConfig] = useState<Record<string, string>>({});
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFluxById(Number(id))
      .then(flux => {
        setName(flux.name);
        setDescription(flux.description || '');
        setConnectorType(flux.connectorType);
        setOutputFormat(flux.outputFormat);
        if (flux.config) {
          try { setConnectorConfig(JSON.parse(flux.config)); } catch { /* ignore malformed config */ }
        }
        if (flux.transformRules && flux.transformRules.length > 0) {
          setRules(flux.transformRules.map(r => ({
            orderIndex: r.orderIndex,
            ruleType: r.ruleType,
            sourceField: r.sourceField,
            targetField: r.targetField,
            params: r.params,
          })));
        }
      })
      .catch(() => toast.error('Erreur lors du chargement du flux'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConnectorConfig = (key: string, value: string) =>
    setConnectorConfig(prev => ({ ...prev, [key]: value }));

  const addRule = () =>
    setRules(prev => [...prev, { orderIndex: prev.length + 1, ruleType: 'RENAME', sourceField: '', targetField: '' }]);

  const updateRule = (index: number, field: keyof Rule, value: string | number) =>
    setRules(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));

  const removeRule = (index: number) =>
    setRules(prev => prev.filter((_, i) => i !== index));

  const buildConfig = (): string => {
    switch (connectorType) {
      case 'DATABASE':
        return JSON.stringify({ query: connectorConfig.query || '' });
      case 'REST_API':
        return JSON.stringify({ url: connectorConfig.url || '', method: connectorConfig.method || 'GET' });
      case 'FILE':
        return JSON.stringify({ filePath: connectorConfig.filePath || '', format: connectorConfig.format || 'JSON' });
      default:
        return '{}';
    }
  };

  const buildConnectorConfig = () => {
    switch (connectorType) {
      case 'DATABASE':
        return { type: connectorType, host: 'localhost', port: 5432, credential: 'postgres' };
      default:
        return { type: connectorType };
    }
  };

  const handleNext = () => setActiveStep(s => Math.min(steps.length - 1, s + 1));
  const handleBack = () => setActiveStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Le nom est requis'); setActiveStep(0); return; }
    setSaving(true);
    try {
      const payload = {
        name, description, connectorType, outputFormat,
        config: buildConfig(),
        connectorConfig: buildConnectorConfig(),
        transformRules: rules,
      };
      if (isEdit) {
        await updateFlux(Number(id), payload);
        toast.success('Flux mis à jour');
      } else {
        await createFlux(payload);
        toast.success('Flux créé');
      }
      navigate('/flux');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const renderConnectorFields = () => {
    switch (connectorType) {
      case 'DATABASE':
        return (
          <TextField
            label="Requête SQL"
            fullWidth
            multiline
            minRows={4}
            placeholder="SELECT * FROM table WHERE ..."
            value={connectorConfig.query || ''}
            onChange={e => handleConnectorConfig('query', e.target.value)}
          />
        );
      case 'REST_API':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="URL" type="url" fullWidth placeholder="https://api.example.com/data"
                value={connectorConfig.url || ''} onChange={e => handleConnectorConfig('url', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select label="Méthode" fullWidth value={connectorConfig.method || 'GET'}
                onChange={e => handleConnectorConfig('method', e.target.value)}
              >
                {['GET', 'POST', 'PUT'].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      case 'FILE':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                label="Chemin du fichier" fullWidth placeholder="/data/input/file.csv"
                value={connectorConfig.filePath || ''} onChange={e => handleConnectorConfig('filePath', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select label="Format" fullWidth value={connectorConfig.format || 'JSON'}
                onChange={e => handleConnectorConfig('format', e.target.value)}
              >
                {['JSON', 'XML', 'CSV'].map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        );
      default:
        return <Typography variant="body2" color="text.secondary">Aucune configuration supplémentaire requise.</Typography>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
    <Box sx={{ padding: 4, maxWidth: 900, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/flux')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
          {isEdit ? 'Modifier le flux' : 'Nouveau flux'}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nom" required fullWidth value={name}
                  onChange={e => setName(e.target.value)} placeholder="Ex: Export clients"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Description" fullWidth value={description}
                  onChange={e => setDescription(e.target.value)} placeholder="Description optionnelle"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Type de connecteur" required fullWidth value={connectorType}
                  onChange={e => { setConnectorType(e.target.value as ConnectorType); setConnectorConfig({}); }}
                >
                  {connectorTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select label="Format de sortie" required fullWidth value={outputFormat}
                  onChange={e => setOutputFormat(e.target.value as OutputFormat)}
                >
                  <MenuItem value="JSON">JSON</MenuItem>
                  <MenuItem value="XML">XML</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#1F4E79', mb: 2 }}>
                Configuration pour le connecteur {connectorType}
              </Typography>
              {renderConnectorFields()}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              {rules.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Aucune règle de transformation définie.
                </Typography>
              )}
              {rules.map((rule, i) => (
                <Accordion key={i} defaultExpanded sx={{ mb: 1.5, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ flexGrow: 1 }}>
                      Règle #{rule.orderIndex} — {rule.ruleType} {rule.sourceField && `(${rule.sourceField} → ${rule.targetField})`}
                    </Typography>
                    <IconButton
                      size="small" color="error"
                      onClick={e => { e.stopPropagation(); removeRule(i); }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="Ordre" type="number" fullWidth value={rule.orderIndex}
                          onChange={e => updateRule(i, 'orderIndex', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          select label="Type" fullWidth value={rule.ruleType}
                          onChange={e => updateRule(i, 'ruleType', e.target.value)}
                        >
                          {ruleTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="Champ source" fullWidth value={rule.sourceField}
                          onChange={e => updateRule(i, 'sourceField', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <TextField
                          label="Champ cible" fullWidth value={rule.targetField}
                          onChange={e => updateRule(i, 'targetField', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Button startIcon={<AddIcon />} variant="outlined" onClick={addRule} sx={{ mt: 1 }}>
                Ajouter une règle
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => navigate('/flux')}>Annuler</Button>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button disabled={activeStep === 0} onClick={handleBack}>Précédent</Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>Suivant</Button>
              ) : (
                <Button variant="contained" loading={saving} onClick={handleSubmit}>
                  Sauvegarder
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
    </motion.div>
  );
};

export default FluxFormPage;
