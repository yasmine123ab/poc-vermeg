export type UserRole = 'ADMIN' | 'OPERATOR';

export interface AuthUser {
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: UserRole;
  expiresIn: number;
}

export type FluxStatus = 'INACTIVE' | 'ACTIVE' | 'RUNNING' | 'ARCHIVED';
export type ConnectorType = 'DATABASE' | 'REST_API' | 'FILE' | 'MESSAGE_QUEUE';
export type OutputFormat = 'JSON' | 'XML';
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'ARCHIVED';
export type LogLevel = 'INFO' | 'WARN' | 'ERROR';
export type RuleType = 'RENAME' | 'FILTER' | 'CAST' | 'CONCAT' | 'DERIVE';

export interface Flux {
  id: number;
  name: string;
  description?: string;
  status: FluxStatus;
  connectorType: ConnectorType;
  outputFormat: OutputFormat;
  config?: string;
  connectorConfig?: {
    type: ConnectorType;
    host?: string;
    port?: number;
    credential?: string;
    extra?: string;
  };
  transformRules?: {
    orderIndex: number;
    ruleType: RuleType;
    sourceField: string;
    targetField: string;
    params?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface FluxRequest {
  name: string;
  description?: string;
  connectorType: ConnectorType;
  outputFormat: OutputFormat;
  config?: string;
  connectorConfig?: {
    type: ConnectorType;
    host?: string;
    port?: number;
    credential?: string;
    extra?: string;
  };
  transformRules?: {
    orderIndex: number;
    ruleType: RuleType;
    sourceField: string;
    targetField: string;
    params?: string;
  }[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Execution {
  id: number;
  fluxId: number;
  fluxName: string;
  status: ExecutionStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  outputFilePath?: string;
  errorMessage?: string;
}

export interface ExecutionLog {
  id: number;
  level: LogLevel;
  message: string;
  step?: string;
  loggedAt: string;
}
