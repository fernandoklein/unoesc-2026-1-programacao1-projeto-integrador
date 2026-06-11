import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './Login.module.css';
import { IconCross } from '../components/icons';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <span className={styles.brandIcon}><IconCross size={24} /></span>
          <h1 className={styles.brandTitle}>G2 Saúde</h1>
          <p className={styles.brandText}>
            Sistema de gestão de profissionais de saúde — cadastro, consulta por
            especialidade e controle de status para integração com agenda e consultas.
          </p>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <h1>Acessar o sistema</h1>
            <p>Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                required
              />
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" className={styles.btn} disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
