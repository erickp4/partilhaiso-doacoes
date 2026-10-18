import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Postagem.module.css';

const API = 'http://localhost:3001';

// Calcula "agora", "5 min", "3h", "2d" a partir do momento em que foi criado
function tempoDecorrido(item){
    if (!item.criadoEm) return item.tempo || ''; // posts antigas, com texto fixo

    const minutos = Math.floor((Date.now() - item.criadoEm) / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;

    return `${Math.floor(horas / 24)}d`;
}

function Postagem({ post, podeExcluir = false, onExcluido = () => {} }){
    const [curtido, setCurtido] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [linkCopiado, setLinkCopiado] = useState(false);

    const [comentariosAbertos, setComentariosAbertos] = useState(false);
    const [comentarios, setComentarios] = useState([]);
    const [novoComentario, setNovoComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');

    // Instituição dona do post (o Feed e o Perfil enviam junto com o post)
    const instituicao = post.instituicao;

    // Busca os comentários desta postagem
    useEffect(() => {
        fetch(`${API}/comentarios?postId=${post.id}&_sort=criadoEm&_order=asc`)
            .then(r => r.json())
            .then(lista => setComentarios(Array.isArray(lista) ? lista : []))
            .catch(() => {});
    }, [post.id]);

    async function comentar(evento){
        evento.preventDefault();

        const texto = novoComentario.trim();
        if (!texto) return;

        setEnviando(true);
        setErro('');

        try {
            // Descobre quem está comentando (instituição ou pessoa)
            const usuario = await fetch(`${API}/usuario`).then(r => r.json());
            let autor = usuario.nome || 'Visitante';

            if (usuario.instituicaoId){
                const minha = await fetch(`${API}/instituicoes/${usuario.instituicaoId}`)
                    .then(r => r.json());
                autor = minha.nome || autor;
            }

            const resposta = await fetch(`${API}/comentarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    autor,
                    texto,
                    criadoEm: Date.now()
                })
            });

            if (!resposta.ok) throw new Error('falhou');

            const salvo = await resposta.json();
            setComentarios([...comentarios, salvo]);
            setNovoComentario('');
        } catch {
            setErro('Não foi possível comentar. O json-server está rodando?');
        } finally {
            setEnviando(false);
        }
    }

    // Copia o link que abre o perfil da instituição já na postagem
    async function compartilhar(){
        const link = `${window.location.origin}/instituicao/${instituicao.id}#post-${post.id}`;

        try {
            await navigator.clipboard.writeText(link);
            setLinkCopiado(true);
            setTimeout(() => setLinkCopiado(false), 2000);
        } catch {
            window.prompt('Copie o link da publicação:', link);
        }
    }

    async function excluir(){
        if (!window.confirm('Excluir esta publicação? Essa ação não pode ser desfeita.')) return;

        setExcluindo(true);

        try {
            // _dependent apaga também os comentários desta postagem
            const resposta = await fetch(
                `${API}/posts/${post.id}?_dependent=comentarios`,
                { method: 'DELETE' }
            );

            if (!resposta.ok) throw new Error('falhou');

            onExcluido();
        } catch {
            alert('Não foi possível excluir. O json-server está rodando?');
            setExcluindo(false);
        }
    }

    return (
        <article id={`post-${post.id}`} className={styles.post}>
            <header className={styles.topo}>
                <Link to={`/instituicao/${instituicao.id}`} className={styles.link}>
                    {instituicao.imagem
                        ? <img src={instituicao.imagem} alt="" className={styles.avatar} />
                        : <div className={styles.avatar} />}
                </Link>
                <div>
                    <Link to={`/instituicao/${instituicao.id}`} className={styles.link}>
                        <strong className={styles.nome}>{instituicao.nome}</strong>
                    </Link>
                    <p className={styles.descricao}>{instituicao.descricao}</p>
                    <p className={styles.tempo}>{tempoDecorrido(post)}</p>
                </div>

                {podeExcluir && (
                    <button
                        type="button"
                        className={styles.excluir}
                        onClick={excluir}
                        disabled={excluindo}
                        title="Excluir publicação"
                        aria-label="Excluir publicação"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M6 6l1 14h10l1-14" />
                            <path d="M10 11v5M14 11v5" />
                        </svg>
                    </button>
                )}
            </header>

            {post.texto && <p className={styles.texto}>{post.texto}</p>}

            {post.imagem && (
                <img
                    src={post.imagem}
                    alt=""
                    className={styles.foto}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            )}

            <footer className={styles.acoes}>
                <button
                    type="button"
                    className={`${styles.botao} ${curtido ? styles.curtido : ''}`}
                    onClick={() => setCurtido(!curtido)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 10v11H3V10h4z" />
                        <path d="M7 10l4-8c1.700 0 3 1.300 3 3v3h6a2 2 0 0 1 2 2.300l-1.300 7A2 2 0 0 1 18.700 21H7" />
                    </svg>
                    {curtido ? 'Curtido' : 'Gostar'}
                </button>

                <button
                    type="button"
                    className={`${styles.botao} ${comentariosAbertos ? styles.curtido : ''}`}
                    onClick={() => setComentariosAbertos(!comentariosAbertos)}
                    aria-expanded={comentariosAbertos}
                >
                    Comentar{comentarios.length > 0 ? ` (${comentarios.length})` : ''}
                </button>

                <button type="button" className={styles.botao} onClick={compartilhar}>
                    {linkCopiado ? 'Link copiado!' : 'Compartilhar'}
                </button>
            </footer>

            {comentariosAbertos && (
                <section className={styles.comentarios}>
                    {comentarios.length === 0 && (
                        <p className={styles.semComentarios}>Seja o primeiro a comentar.</p>
                    )}

                    {comentarios.map(c => (
                        <div key={c.id} className={styles.comentario}>
                            <div className={styles.inicial}>
                                {(c.autor || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>{c.autor}</strong>
                                <span className={styles.quando}>{tempoDecorrido(c)}</span>
                                <p>{c.texto}</p>
                            </div>
                        </div>
                    ))}

                    <form className={styles.novoComentario} onSubmit={comentar}>
                        <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            maxLength={300}
                            value={novoComentario}
                            onChange={(e) => setNovoComentario(e.target.value)}
                        />
                        <button type="submit" disabled={enviando || !novoComentario.trim()}>
                            Enviar
                        </button>
                    </form>

                    {erro && <p className={styles.erroComentario}>{erro}</p>}
                </section>
            )}
        </article>
    );
}

export default Postagem;