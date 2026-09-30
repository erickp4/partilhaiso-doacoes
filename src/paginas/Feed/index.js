import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BarraLateral from '../../componentes/BarraLateral';
import Postagem from '../../componentes/Postagem';
import styles from './Feed.module.css';

// Tira acentos e deixa minúsculo, para a busca ignorar isso
function normalizar(texto){
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Foto pequena da instituição (ou um quadradinho cinza se não tiver)
function Miniatura({ instituicao }){
    return instituicao.imagem
        ? <img src={instituicao.imagem} alt="" className={styles.mini} />
        : <div className={styles.mini} />;
}

function Feed(){
    const [posts, setPosts] = useState([]);
    const [instituicoes, setInstituicoes] = useState([]);
    const [usuario, setUsuario] = useState({ nome: '', seguindo: [] });
    const [busca, setBusca] = useState('');
    const [erro, setErro] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:3001/posts').then(r => r.json()),
            fetch('http://localhost:3001/instituicoes').then(r => r.json()),
            fetch('http://localhost:3001/usuario').then(r => r.json())
        ])
            .then(([dadosPosts, dadosInst, dadosUsuario]) => {
                setPosts(Array.isArray(dadosPosts) ? dadosPosts : []);
                setInstituicoes(Array.isArray(dadosInst) ? dadosInst : []);
                setUsuario({ nome: '', seguindo: [], ...dadosUsuario });
            })
            .catch(() => setErro(true));
    }, [versao]);

    const locais = instituicoes.filter(i => !usuario.seguindo.includes(i.id));

    // Junta cada post com a instituição dona dele (pelo instituicaoId)
    const postsCompletos = posts
        .map(p => ({ ...p, instituicao: instituicoes.find(i => i.id === p.instituicaoId) }))
        .filter(p => p.instituicao)
        .sort((a, b) => b.id - a.id);

    // A busca filtra os posts pelo nome da instituição
    const postsFiltrados = postsCompletos.filter(p =>
        normalizar(p.instituicao.nome).includes(normalizar(busca))
    );

    return (
        <div className={styles.pagina}>
            {/* ---------- Barra lateral esquerda ---------- */}
            <BarraLateral onPostou={() => setVersao(v => v + 1)} />

            {/* ---------- Área principal ---------- */}
            <main className={styles.principal}>
                <h1 className={styles.pergunta}>Procurando uma instituição específica?</h1>

                <div className={styles.busca}>
                    <input
                        type="text"
                        placeholder="Digite o nome da instituição: ex: Abrigo Por do Sol"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                         stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"
                         aria-hidden="true">
                        <circle cx="10" cy="10" r="6.5" />
                        <line x1="15" y1="15" x2="22" y2="22" />
                    </svg>
                </div>

                <div className={styles.colunas}>
                    <section className={styles.feed}>
                        {erro && (
                            <p className={styles.aviso}>
                                Não foi possível carregar o feed. O json-server está rodando?
                            </p>
                        )}

                        {!erro && postsFiltrados.length === 0 && (
                            <p className={styles.aviso}>Nenhuma publicação encontrada.</p>
                        )}

                        {postsFiltrados.map(post => (
                            <Postagem
                                key={post.id}
                                post={post}
                                podeExcluir={usuario.instituicaoId === post.instituicaoId}
                                onExcluido={() => setVersao(v => v + 1)}
                            />
                        ))}
                    </section>

                    <aside className={styles.locais}>
                        <h2>Instituições locais &gt;</h2>
                        <ul>
                            {locais.map(item => (
                                <li key={item.id}>
                                    <Miniatura instituicao={item} />
                                    {item.nome}
                                </li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Feed;