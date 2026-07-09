import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F8F7' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
