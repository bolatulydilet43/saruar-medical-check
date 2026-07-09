import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const TODAY_LABEL = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F8F7' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div
          data-noprint="1"
          style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 32px', borderBottom: '1px solid #EAEDEC', background: '#FFFFFF', flexShrink: 0 }}
        >
          <div style={{ fontSize: 13, color: '#6B7280', textTransform: 'capitalize' }}>{TODAY_LABEL}</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
