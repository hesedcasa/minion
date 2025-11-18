import { Typography } from 'antd';

const { Title } = Typography;

export function Header() {
  return (
    <header>
      <Title level={3} style={{ margin: 0 }}>
        🎵 Minion
      </Title>
    </header>
  );
}
