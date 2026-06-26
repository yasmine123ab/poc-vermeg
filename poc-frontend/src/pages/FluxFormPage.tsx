import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getFluxById, createFlux, updateFlux } from '../api/fluxApi';
import { ConnectorType, OutputFormat, RuleType } from '../types';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '6px',
  border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '6px', fontSize: '13px',
  fontWeight: 600, color: '#444',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '15px', fontWeight: 700, color: '#1F4E79',
  margin: '28px 0 16px', paddingBottom: '8px',
  borderBottom: '2px solid #e8f0fe',
};

interface Rule {
  orderIndex: number;
  ruleType: RuleType;
  sourceField: string;
  targetField: string;
  params?: string;
}

const FluxFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

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
          try { setConnectorConfig(JSON.parse(flux.config)); } catch {}
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
      case 'REST_API':
        return { type: connectorType };
      case 'FILE':
        return { type: connectorType };
      default:
        return { type: connectorType };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Le nom est requis'); return; }
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
          <div>
            <label style={labelStyle}>Requête SQL</label>
            <textarea
              rows={4} style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="SELECT * FROM table WHERE ..."
              value={connectorConfig.query || ''}
              onChange={e => handleConnectorConfig('query', e.target.value)}
            />
          </div>
        );
      case 'REST_API':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>URL</label>
              <input style={inputStyle} type="url" placeholder="https://api.example.com/data"
                value={connectorConfig.url || ''} onChange={e => handleConnectorConfig('url', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Méthode</label>
              <select style={inputStyle} value={connectorConfig.method || 'GET'}
                onChange={e => handleConnectorConfig('method', e.target.value)}>
                <option>GET</option><option>POST</option><option>PUT</option>
              </select>
            </div>
          </div>
        );
      case 'FILE':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Chemin du fichier</label>
              <input style={inputStyle} type="text" placeholder="/data/input/file.csv"
                value={connectorConfig.filePath || ''} onChange={e => handleConnectorConfig('filePath', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Format</label>
              <select style={inputStyle} value={connectorConfig.format || 'JSON'}
                onChange={e => handleConnectorConfig('format', e.target.value)}>
                <option>JSON</option><option>XML</option><option>CSV</option>
              </select>
            </div>
          </div>
        );
      default:
        return <p style={{ color: '#888', fontSize: '13px' }}>Aucune configuration supplémentaire requise.</p>;
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Chargement...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button onClick={() => navigate('/flux')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2E75B6', fontSize: '20px' }}>←</button>
        <h1 style={{ color: '#1F4E79', fontSize: '24px', margin: 0 }}>
          {isEdit ? 'Modifier le flux' : 'Nouveau flux'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <p style={sectionTitle}>Informations générales</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Nom <span style={{ color: '#dc3545' }}>*</span></label>
              <input style={inputStyle} type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Export clients" required />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input style={inputStyle} type="text" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Description optionnelle" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Type de connecteur <span style={{ color: '#dc3545' }}>*</span></label>
              <select style={inputStyle} value={connectorType}
                onChange={e => { setConnectorType(e.target.value as ConnectorType); setConnectorConfig({}); }}>
                <option value="DATABASE">DATABASE</option>
                <option value="REST_API">REST_API</option>
                <option value="FILE">FILE</option>
                <option value="MESSAGE_QUEUE">MESSAGE_QUEUE</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Format de sortie <span style={{ color: '#dc3545' }}>*</span></label>
              <select style={inputStyle} value={outputFormat} onChange={e => setOutputFormat(e.target.value as OutputFormat)}>
                <option value="JSON">JSON</option>
                <option value="XML">XML</option>
              </select>
            </div>
          </div>

          <p style={sectionTitle}>Configuration du connecteur</p>
          {renderConnectorFields()}

          <p style={sectionTitle}>Règles de transformation</p>
          {rules.map((rule, i) => (
            <div key={i} style={{
              background: '#F2F2F2', borderRadius: '8px', padding: '16px',
              marginBottom: '12px', position: 'relative',
            }}>
              <button type="button" onClick={() => removeRule(i)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: '#dc3545', color: '#fff', border: 'none',
                  borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '14px',
                }}>×</button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Ordre</label>
                  <input style={inputStyle} type="number" value={rule.orderIndex}
                    onChange={e => updateRule(i, 'orderIndex', Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={rule.ruleType}
                    onChange={e => updateRule(i, 'ruleType', e.target.value)}>
                    {(['RENAME','FILTER','CAST','CONCAT','DERIVE'] as RuleType[]).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Champ source</label>
                  <input style={inputStyle} type="text" value={rule.sourceField}
                    onChange={e => updateRule(i, 'sourceField', e.target.value)} placeholder="sourceField" />
                </div>
                <div>
                  <label style={labelStyle}>Champ cible</label>
                  <input style={inputStyle} type="text" value={rule.targetField}
                    onChange={e => updateRule(i, 'targetField', e.target.value)} placeholder="targetField" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRule}
            style={{
              padding: '8px 18px', borderRadius: '6px', border: '2px dashed #2E75B6',
              background: 'transparent', color: '#2E75B6', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}>
            + Ajouter une règle
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" onClick={() => navigate('/flux')}
            style={{ padding: '10px 24px', borderRadius: '7px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>
            Annuler
          </button>
          <button type="submit" disabled={saving}
            style={{
              padding: '10px 28px', borderRadius: '7px', border: 'none',
              background: saving ? '#aaa' : '#1F4E79', color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600,
            }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FluxFormPage;
