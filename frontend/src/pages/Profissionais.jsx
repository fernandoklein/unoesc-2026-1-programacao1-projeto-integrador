import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import styles from './Profissionais.module.css';
import { IconPlus, IconX, IconSearch, IconPencil } from '../components/icons';

const FORM_VAZIO = { nome: '', crm: '', especialidade: '', telefone: '', email: '' };

export default function Profissionais() {
  const [lista, setLista] = useState([]);
  const [filtros, setFiltros] = useState({ nome: '', especialidade: '' });
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const buscar = useCallback(async () => {
    const params = {};
    if (filtros.nome) params.nome = filtros.nome;
    if (filtros.especialidade) params.especialidade = filtros.especialidade;
    try {
      const { data } = await api.get('/profissionais', { params });
      setLista(data);
    } catch {
      setLista([]);
    }
  }, [filtros]);

  useEffect(() => { buscar(); }, [buscar]);

  function abrirCriar() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setErro('');
    setModalAberto(true);
  }

  function abrirEditar(p) {
    setEditando(p);
    setForm({
      nome: p.nome,
      crm: p.crm,
      especialidade: p.especialidade,
      telefone: p.telefone || '',
      email: p.email || '',
    });
    setErro('');
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
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
      if (editando) {
        await api.put(`/profissionais/${editando.id}`, form);
      } else {
        await api.post('/profissionais', form);
      }
      fecharModal();
      buscar();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar profissional');
    } finally {
      setSalvando(false);
    }
  }

  async function toggleStatus(p) {
    try {
      await api.patch(`/profissionais/${p.id}/status`, { ativo: !p.ativo });
      buscar();
    } catch {
      /* silencioso */
    }
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.titulo}>Profissionais de Saúde</h2>
          <p className={styles.subtitulo}>Cadastre e gerencie os profissionais do sistema</p>
        </div>
        <button className={styles.btnNovo} onClick={abrirCriar}>
          <IconPlus size={16} /> Novo Profissional
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.campoBusca}>
          <IconSearch size={16} className={styles.iconeBusca} />
          <input
            placeholder="Buscar por nome..."
            value={filtros.nome}
            onChange={(e) => setFiltros((f) => ({ ...f, nome: e.target.value }))}
          />
        </div>
        <div className={styles.campoBusca}>
          <IconSearch size={16} className={styles.iconeBusca} />
          <input
            placeholder="Buscar por especialidade..."
            value={filtros.especialidade}
            onChange={(e) => setFiltros((f) => ({ ...f, especialidade: e.target.value }))}
          />
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CRM</th>
              <th>Especialidade</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.vazio}>
                  Nenhum profissional encontrado.
                </td>
              </tr>
            ) : (
              lista.map((p) => (
                <tr key={p.id}>
                  <td className={styles.nome}>{p.nome}</td>
                  <td>{p.crm}</td>
                  <td>{p.especialidade}</td>
                  <td>{p.telefone || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${p.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.acoes}>
                      <button className={styles.btnEditar} onClick={() => abrirEditar(p)}>
                        <IconPencil size={14} /> Editar
                      </button>
                      <button
                        className={p.ativo ? styles.btnInativar : styles.btnAtivar}
                        onClick={() => toggleStatus(p)}
                      >
                        {p.ativo ? 'Inativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
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
              <h3>{editando ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              <button className={styles.btnFechar} onClick={fecharModal}><IconX size={18} /></button>
            </div>

            <form onSubmit={salvar} className={styles.modalForm}>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Nome completo *</label>
                  <input name="nome" value={form.nome} onChange={handleForm} required placeholder="Ex: Dr. João Silva" />
                </div>

                <div className={styles.field}>
                  <label>CRM *</label>
                  <input name="crm" value={form.crm} onChange={handleForm} required placeholder="Ex: CRM/SP 123456" />
                </div>

                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Especialidade *</label>
                  <input name="especialidade" value={form.especialidade} onChange={handleForm} required placeholder="Ex: Cardiologia" />
                </div>

                <div className={styles.field}>
                  <label>Telefone</label>
                  <input name="telefone" value={form.telefone} onChange={handleForm} placeholder="Ex: (11) 99999-9999" />
                </div>

                <div className={styles.field}>
                  <label>E-mail</label>
                  <input name="email" type="email" value={form.email} onChange={handleForm} placeholder="Ex: joao@clinica.com" />
                </div>
              </div>

              {erro && <p className={styles.erro}>{erro}</p>}

              <div className={styles.modalRodape}>
                <button type="button" className={styles.btnCancelar} onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSalvar} disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
