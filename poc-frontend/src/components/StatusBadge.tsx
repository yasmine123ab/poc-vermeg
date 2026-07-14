import React from 'react';
import { Chip } from '@mui/material';
import { FluxStatus, ExecutionStatus } from '../types';

type Status = FluxStatus | ExecutionStatus;

const colorMap: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: '#d4edda', color: '#155724' },
  SUCCESS:   { bg: '#d4edda', color: '#155724' },
  INACTIVE:  { bg: '#e2e3e5', color: '#383d41' },
  RUNNING:   { bg: '#fff3cd', color: '#856404' },
  PENDING:   { bg: '#fff3cd', color: '#856404' },
  FAILED:    { bg: '#f8d7da', color: '#721c24' },
  CANCELLED: { bg: '#d6d6d6', color: '#4a4a4a' },
  ARCHIVED:  { bg: '#d6d6d6', color: '#4a4a4a' },
};

interface Props {
  status: Status;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const style = colorMap[status] || { bg: '#e2e3e5', color: '#383d41' };
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, fontSize: '11px' }}
    />
  );
};

export default StatusBadge;
