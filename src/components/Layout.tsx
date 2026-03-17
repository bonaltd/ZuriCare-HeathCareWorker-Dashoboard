import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BackgroundDecorations from './BackgroundDecorations';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <BackgroundDecorations />
      <Sidebar />
      <main className="layout-main">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}
