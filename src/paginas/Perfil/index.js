import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BarraLateral from '../../componentes/BarraLateral';
import Postagem from '../../componentes/Postagem';
import styles from './Perfil.module.css';

function moeda(valor){
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function textoEstoque(item){
    if (item.dinheiro) {
        return `${moeda(item.atual)} / ${moeda(item.meta)}`;
    }
    return `Qtd em estoque: ${item.atual}${item.meta ? `/${item.meta}` : ''}`;
}

function Perfil(){
    // useParams pega o :id que está na URL
    const { id } = useParams();

    const [instituicao, setInstituicao] = useState(null);
    const [posts, setPosts] = useState([]);
    const [usuario, setUsuario] = useState({});
    const [seguindo, setSeguindo] = useState(false);
    const [erro, setErro] = useState(false);
    const [versao, setVersao] = useState(0);

    useEffect(() => {
        setInstituicao(null);
        setErro(false);

        Promise.all([
            fetch(`http://localhost:3001/instituicoes/${id}`).then(r => {
                if (!r.ok) throw new Error('não encontrada');
                return r.json();
            }),
            fetch(`http://localhost:3001/posts?instituicaoId=${id}`).then(r => r.json()),
            fetch('http://localhost:3001/usuario').then(r => r.json())
        ])
            .then(([dadosInst, dadosPosts, dadosUsuario]) => {
                // Se a lista de posts vier errada, usa uma lista vazia em vez de quebrar
                const listaPosts = Array.isArray(dadosPosts) ? dadosPosts : [];

                setInstituicao(dadosInst);
                setPosts(listaPosts.map(p => ({ ...p, instituicao: dadosInst })).sort((a, b) => b.id - a.id));
                setUsuario(dadosUsuario || {});
                setSeguindo((dadosUsuario?.seguindo || []).includes(dadosInst.id));
            })
            .catch(() => setErro(true));
    }, [id, versao]);

    // É o dono quando a instituição da pessoa logada é esta
    const ehDono = instituicao && usuario.instituicaoId === instituicao.id;

    function compartilhar(){
        navigator.clipboard?.writeText(window.location.href);
        alert('Link do perfil copiado!');
    }

    const itens = (instituicao?.itens || [])
        .filter(item => item.ativo !== false)
        .sort((a, b) => Number(Boolean(b.urgente)) - Number(Boolean(a.urgente)));

    return (
        <div className={styles.pagina}>
            <BarraLateral perfilId={Number(id)} onPostou={() => setVersao(v => v + 1)} />

            <main className={styles.principal}>
                {erro && (
                    <p className={styles.aviso}>
                        Não foi possível carregar esta instituição. O json-server está rodando?
                    </p>
                )}
                {!erro && !instituicao && <p className={styles.aviso}>Carregando...</p>}

                {instituicao && (
                    <>
                        <section className={styles.capa}>
                            {/* Só o dono pode trocar a capa */}
                            {ehDono && (
                                <button className={styles.camera} aria-label="Trocar capa">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="1.8"
                                         strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 8a2 2 0 0 1 2-2h2l1.500-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                                        <circle cx="12" cy="13" r="3.500" />
                                    </svg>
                                </button>
                            )}
                        </section>

                        <section className={styles.cabecalho}>
                            <div className={styles.identidade}>
                                {instituicao.imagem
                                    ? <img src={instituicao.imagem} alt="" className={styles.avatar} />
                                    : <div className={styles.avatar} />}
                                <h1 className={styles.nome}>{instituicao.nome}</h1>
                            </div>

                            <div className={styles.dados}>
                                {/* Quem é dono não segue a própria instituição */}
                                {!ehDono && (
                                    <button
                                        className={styles.seguir}
                                        onClick={() => setSeguindo(!seguindo)}
                                    >
                                        {seguindo ? 'Seguindo' : 'Seguir'}
                                    </button>
                                )}
                                {instituicao.endereco && <p>{instituicao.endereco}</p>}
                                {instituicao.email && <p>Email: {instituicao.email}</p>}
                                {instituicao.pix && (
                                    <>
                                        <p>Chave pix: {instituicao.pix}</p>
                                        <small>Faça sua doação por essa chave pix</small>
                                    </>
                                )}
                            </div>

                            <div className={styles.icones}>
                                {!ehDono && (
                                    <Link to="/chat" className={styles.icone} aria-label="Conversar">
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                                        </svg>
                                    </Link>
                                )}
                                <button className={styles.icone} onClick={compartilhar} aria-label="Compartilhar">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="18" cy="5" r="3" />
                                        <circle cx="6" cy="12" r="3" />
                                        <circle cx="18" cy="19" r="3" />
                                        <path d="M8.500 10.500l7-4M8.500 13.500l7 4" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </button>
                            </div>
                        </section>

                        <div className={styles.conteudo}>
                            {instituicao.meta && (
                                <section>
                                    <div className={styles.barra}>
                                        <div
                                            className={styles.progresso}
                                            style={{
                                                width: `${Math.min(100, (instituicao.meta.atual / instituicao.meta.total) * 100)}%`
                                            }}
                                        />
                                        <span>
                                            Meta: {moeda(instituicao.meta.atual)} de {moeda(instituicao.meta.total)}
                                        </span>
                                    </div>
                                    <small className={styles.legenda}>
                                        Esse dinheiro ajuda a manter a instituição funcionando
                                    </small>
                                </section>
                            )}

                            {itens.length > 0 && (
                                <>
                                    <h2 className={styles.secao}>Itens que você pode doar:</h2>
                                    <div className={styles.itens}>
                                        {itens.map(item => (
                                            <article
                                                key={item.nome}
                                                className={`${styles.item} ${item.urgente ? styles.urgente : ''}`}
                                            >
                                                <h3>{item.nome}</h3>
                                                <span className={styles.emoji}>{item.icone}</span>
                                                <p>{textoEstoque(item)}</p>
                                            </article>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h2 className={styles.secao}>Sobre a instituição:</h2>
                            <p className={styles.sobre}>{instituicao.sobre}</p>
                        </div>

                        <section className={styles.publicacoes}>
                            <h2 className={styles.secao}>Publicações:</h2>
                            <div className={styles.posts}>
                                {posts.length === 0 && <p>Nenhuma publicação ainda.</p>}
                                {posts.map(post => (
                                    <Postagem
                                        key={post.id}
                                        post={post}
                                        podeExcluir={ehDono}
                                        onExcluido={() => setVersao(v => v + 1)}
                                    />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default Perfil;