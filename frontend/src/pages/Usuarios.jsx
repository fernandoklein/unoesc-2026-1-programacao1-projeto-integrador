import { useState, useEffect } from 'react';
import api from '../api';
import styles from './Usuarios.module.css';
import { IconPlus, IconX } from '../components/icons';

const FORM_VAZIO = { nome: '', email: '', senha: '' };

export default function Usuarios() {
  const [lista, setLista] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  async function buscar() {
    try {
      const { data } = await api.get('/usuarios');
      setLista(data);
    } catch {
      setLista([]);
    }
  }

  useEffect(() => { buscar(); }, []);

  function abrirModal() {
    setForm(FORM_VAZIO);
    setErro('');
    setSucesso('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setErro('');
  }

  function handleForm(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await api.post('/usuarios', form);
      fecharModal();
      setSucesso('Usuário criado com sucesso!');
      buscar();
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  }

  function formatarData(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.titulo}>Usuários do Sistema</h2>
          <p className={styles.subtitulo}>Gerencie os acessos ao sistema</p>
        </div>
        <button className={styles.btnNovo} onClick={abrirModal}>
          <IconPlus size={16} /> Novo Usuário
        </button>
      </div>

      {sucesso && <p className={styles.sucesso}>{sucesso}</p>}

      <div className={styles.card}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.vazio}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              lista.map((u) => (
                <tr key={u.id}>
                  <td className={styles.nome}>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{formatarData(u.criado_em)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Novo Usuário</h3>
              <button className={styles.btnFechar} onClick={fecharModal}><IconX size={18} /></button>
            </div>

            <form onSubmit={salvar} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Nome completo *</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleForm}
                  required
                  placeholder="Ex: Maria Souza"
                  autoFocus
                />
              </div>

              <div className={styles.field}>
                <label>E-mail *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleForm}
                  required
                  placeholder="Ex: maria@clinica.com"
                />
              </div>

              <div className={styles.field}>
                <label>Senha * <span className={styles.dica}>(mínimo 6 caracteres)</span></label>
                <input
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleForm}
                  required
                  minLength={6}
                  placeholder="••••••"
                />
              </div>

              {erro && <p className={styles.erro}>{erro}</p>}

              <div className={styles.modalRodape}>
                <button type="button" className={styles.btnCancelar} onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSalvar} disabled={salvando}>
                  {salvando ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
