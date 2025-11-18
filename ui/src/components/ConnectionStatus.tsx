import { Badge } from 'antd';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <Badge
      status={isConnected ? 'success' : 'error'}
      text={isConnected ? 'Connected' : 'Disconnected'}
    />
  );
}
