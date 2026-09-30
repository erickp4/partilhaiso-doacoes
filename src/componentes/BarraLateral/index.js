import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../Cabecalho/logo.png';
import styles from './BarraLateral.module.css';
import CriarPostagem from '../CriarPostagem';

// perfilId: id do perfil que está aberto na tela (só existe na página de perfil)
function BarraLateral({ perfilId, onPostou = () => {} }){
    const [usuario, setUsuario] = useState({ nome: '', seguindo: [] });
    const [instituicoes, setInstituicoes] = useState([]);
    const [postando, setPostando] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:3001/usuario').then(r => r.json()),
            fetch('http://localhost:3001/instituicoes').then(r => r.json())
        ])
            .then(([dadosUsuario, dadosInst]) => {
                setUsuario({ nome: '', seguindo: [], ...dadosUsuario });
                setInstituicoes(Array.isArray(dadosInst) ? dadosInst : []);
            })
            .catch(() => {});
    }, []);

    const seguindo = instituicoes.filter(i => usuario.seguindo.includes(i.id));

    // É dono se o perfil aberto for a instituição da pessoa logada
    const ehDono = perfilId !== undefined && usuario.instituicaoId === perfilId;

    const linkPerfil = usuario.instituicaoId
        ? `/instituicao/${usuario.instituicaoId}`
        : '/perfil';

    return (
        <aside className={styles.lateral}>
            <div className={styles.topo}>
                <Link to="/feed">
                    <img src={logo} alt="Logo Partilhaiso" className={styles.logo} />
                </Link>

                <div className={styles.boasVindas}>
                    {usuario.imagem
                        ? <img src={usuario.imagem} alt="" className={styles.fotoUsuario} />
                        : <div className={styles.fotoUsuario} />}
                    <div>
                        <span>Bem vindo!</span>
                        <strong>{usuario.nome}</strong>
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
                        onClick={() => setPostando(true)}
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
            {postando && (
                <CriarPostagem
                    instituicaoId={usuario.instituicaoId}
                    onFechar={() => setPostando(false)}
                    onPostou={onPostou}
                />
            )}
        </aside>
    );
}

export default BarraLateral;