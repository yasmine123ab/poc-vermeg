import React from 'react';

interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({ title, message, onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '32px',
        minWidth: '360px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <h3 style={{ margin: '0 0 12px', color: '#1F4E79', fontSize: '18px' }}>{title}</h3>
      <p style={{ margin: '0 0 24px', color: '#555', lineHeight: '1.5' }}>{message}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 20px', borderRadius: '6px',
            border: '1px solid #ccc', background: '#fff',
            cursor: 'pointer', fontSize: '14px', color: '#555',
          }}
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '8px 20px', borderRadius: '6px',
            border: 'none', background: '#dc3545',
            color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
          }}
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
