interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="status-indicator">
      <span className={`status-dot ${isConnected ? 'connected' : ''}`} />
      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
}
