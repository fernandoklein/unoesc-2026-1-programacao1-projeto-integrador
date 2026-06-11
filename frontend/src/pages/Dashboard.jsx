import { useEffect, useState } from 'react';
import api from '../api';
import styles from './Dashboard.module.css';
import { IconStethoscope, IconUserCheck, IconUserX } from '../components/icons';

export default function Dashboard() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [stats, setStats] = useState({ total: 0, ativos: 0, inativos: 0 });

  useEffect(() => {
    api.get('/profissionais').then(({ data }) => {
      setStats({
        total: data.length,
        ativos: data.filter((p) => p.ativo).length,
        inativos: data.filter((p) => !p.ativo).length,
      });
    });
  }, []);

  return (
    <div>
      <h2 className={styles.titulo}>Olá, {usuario.nome?.split(' ')[0]}</h2>
      <p className={styles.subtitulo}>Bem-vindo ao sistema de gestão de profissionais de saúde.</p>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.azul}`}>
          <div className={styles.cardIcone}><IconStethoscope size={20} /></div>
          <div className={styles.cardTextos}>
            <span className={styles.cardValor}>{stats.total}</span>
            <span className={styles.cardLabel}>Total de Profissionais</span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.verde}`}>
          <div className={styles.cardIcone}><IconUserCheck size={20} /></div>
          <div className={styles.cardTextos}>
            <span className={styles.cardValor}>{stats.ativos}</span>
            <span className={styles.cardLabel}>Ativos</span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.cinza}`}>
          <div className={styles.cardIcone}><IconUserX size={20} /></div>
          <div className={styles.cardTextos}>
            <span className={styles.cardValor}>{stats.inativos}</span>
            <span className={styles.cardLabel}>Inativos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
