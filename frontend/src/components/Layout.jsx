import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './Layout.module.css';
import { IconCross, IconGrid, IconStethoscope, IconUsers, IconLogOut, IconMenu } from './icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/profissionais', label: 'Profissionais', icon: IconStethoscope },
  { to: '/usuarios', label: 'Usuários', icon: IconUsers },
];

export default function Layout() {
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(true);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  async function sair() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* segue para o login mesmo se a chamada falhar */
    }
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${sidebarAberta ? '' : styles.fechada}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logoIcon}><IconCross size={18} /></span>
          {sidebarAberta && (
            <div>
              <span className={styles.logoNome}>G2 Saúde</span>
              <span className={styles.logoSub}>Profissionais</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.ativo : ''}`
              }
            >
              <span className={styles.navIcon}><item.icon size={18} /></span>
              {sidebarAberta && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button className={styles.sairBtn} onClick={sair}>
          <span className={styles.navIcon}><IconLogOut size={18} /></span>
          {sidebarAberta && <span>Sair</span>}
        </button>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarAberta((v) => !v)}
            title="Alternar menu"
          >
            <IconMenu size={20} />
          </button>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {usuario.nome ? usuario.nome[0].toUpperCase() : '?'}
            </div>
            <span className={styles.userName}>{usuario.nome || 'Usuário'}</span>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
