import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../Cabecalho/logo.png';
import CriarPostagem from '../CriarPostagem';
import styles from './BarraLateral.module.css';

// Se você trocou o endereço por proxy (passo do celular), use: const API = '';
const API = 'http://localhost:3001';

// perfilId: id do perfil aberto na tela (só existe na página de perfil)
// versao: muda quando alguém segue/deixa de seguir, para recarregar a lista
function BarraLateral({ perfilId, versao = 0, onPostou = () => {} }){
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({ nome: '', seguindo: [] });
    const [instituicoes, setInstituicoes] = useState([]);
    const [postando, setPostando] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`${API}/usuario`).then(r => r.json()),
            fetch(`${API}/instituicoes`).then(r => r.json())
        ])
            .then(([dadosUsuario, dadosInst]) => {
                setUsuario({ nome: '', seguindo: [], ...dadosUsuario });
                setInstituicoes(Array.isArray(dadosInst) ? dadosInst : []);
            })
            .catch(() => {});
    }, [versao]);

    // Esc fecha o menu no celular
    useEffect(() => {
        if (!menuAberto) return;

        function aoApertar(evento){
            if (evento.key === 'Escape') setMenuAberto(false);
        }

        document.addEventListener('keydown', aoApertar);
        return () => document.removeEventListener('keydown', aoApertar);
    }, [menuAberto]);

    function sair(){
        // Quando existir login de verdade, é aqui que a sessão será encerrada
        navigate('/login');
    }

    const seguindo = instituicoes.filter(i => usuario.seguindo.includes(i.id));

    // Se a pessoa logada tem uma instituição, usa a foto e o nome dela
    const minhaInstituicao = instituicoes.find(i => i.id === usuario.instituicaoId);
    const fotoPerfil = minhaInstituicao?.imagem || usuario.imagem;
    const nomePerfil = minhaInstituicao?.nome || usuario.nome;

    // É dono se o perfil aberto for a instituição da pessoa logada
    const ehDono = perfilId !== undefined && usuario.instituicaoId === perfilId;

    const linkPerfil = usuario.instituicaoId
        ? `/instituicao/${usuario.instituicaoId}`
        : '/perfil';

    return (
        <>
            {/* ---------- Só no celular: barra fina com o botão de menu ---------- */}
            <div className={styles.barraMobile}>
                <Link to="/feed">
                    <img src={logo} alt="Logo Partilhaiso" className={styles.logoMobile} />
                </Link>
                <button
                    type="button"
                    className={styles.hamburguer}
                    onClick={() => setMenuAberto(true)}
                    aria-label="Abrir menu"
                    aria-expanded={menuAberto}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="4" y1="7" x2="20" y2="7" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                </button>
            </div>
            {/* Reserva o espaço da barra fixa, para ela não cobrir o conteúdo */}
            <div className={styles.espaco} />

            {/* Fundo escuro atrás da gaveta (clicar nele fecha o menu) */}
            {menuAberto && (
                <div className={styles.fundoMenu} onClick={() => setMenuAberto(false)} />
            )}

            {/* ---------- Barra lateral (no celular vira a gaveta) ---------- */}
            <aside
                className={`${styles.lateral} ${menuAberto ? styles.aberta : ''}`}
                // Tocar em qualquer link fecha o menu
                onClick={(e) => { if (e.target.closest('a')) setMenuAberto(false); }}
            >
                <button
                    type="button"
                    className={styles.fecharMenu}
                    onClick={() => setMenuAberto(false)}
                    aria-label="Fechar menu"
                >
                    ×
                </button>

                <div className={styles.topo}>
                    <Link to="/feed">
                        <img src={logo} alt="Logo Partilhaiso" className={styles.logo} />
                    </Link>

                    <div className={styles.boasVindas}>
                        {fotoPerfil
                            ? <img src={fotoPerfil} alt="" className={styles.fotoUsuario} />
                            : <div className={styles.fotoUsuario} />}
                        <div>
                            <span>Bem vindo!</span>
                            <strong>{nomePerfil}</strong>
                        </div>
                    </div>

                    <nav className={styles.menu}>
                        <Link to={linkPerfil}>Perfil</Link>

                        {/* Só aparece para o dono do perfil */}
                        {ehDono && (
                            <ul className={styles.subitens}>
                                <li><Link to="/editar-perfil">&gt; Editar perfil</Link></li>
                                <li><Link to="/fazer-pedidos">&gt; Fazer pedidos</Link></li>
                            </ul>
                        )}

                        <Link to="/chat">Chat</Link>
                        <button
                            type="button"
                            className={styles.postar}
                            onClick={() => { setMenuAberto(false); setPostando(true); }}
                        >
                            <span>+</span> Postar
                        </button>
                    </nav>
                </div>

                <div className={styles.seguindo}>
                    <h2>Instituições que sigo &gt;</h2>
                    <ul>
                        {seguindo.map(item => (
                            <li key={item.id}>
                                <Link to={`/instituicao/${item.id}`}>
                                    {item.imagem
                                        ? <img src={item.imagem} alt="" className={styles.mini} />
                                        : <div className={styles.mini} />}
                                    {item.nome}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link to="/instituicoes" className={styles.instituicoes}>
                    Instituições
                </Link>
                <button type="button" className={styles.sair} onClick={sair}>
                    Sair
                </button>
            </aside>

            {postando && (
                <CriarPostagem
                    instituicaoId={usuario.instituicaoId}
                    onFechar={() => setPostando(false)}
                    onPostou={onPostou}
                />
            )}
        </>
    );
}

export default BarraLateral;