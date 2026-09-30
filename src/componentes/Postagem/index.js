import { useState } from 'react';
import styles from './Postagem.module.css';

// Calcula "agora", "5 min", "3h", "2d" a partir do momento da postagem
function tempoDecorrido(post){
    if (!post.criadoEm) return post.tempo || ''; // posts antigas, com texto fixo

    const minutos = Math.floor((Date.now() - post.criadoEm) / 60000);
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h`;

    return `${Math.floor(horas / 24)}d`;
}

function Postagem({ post, podeExcluir = false, onExcluido = () => {} }){
    // Guarda se a pessoa curtiu ou não
    const [curtido, setCurtido] = useState(false);
    const [excluindo, setExcluindo] = useState(false);

    // Vem do fetch com ?_expand=instituicao (dados da instituição dona do post)
    const instituicao = post.instituicao;

    async function excluir(){
    if (!window.confirm('Excluir esta publicação? Essa ação não pode ser desfeita.')) return;

    setExcluindo(true);

    try {
        // DELETE apaga o registro do db.json
        const resposta = await fetch(`http://localhost:3001/posts/${post.id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) throw new Error('falhou');

        onExcluido(); // avisa a página para recarregar as publicações
    } catch {
        alert('Não foi possível excluir. O json-server está rodando?');
        setExcluindo(false);
    }
}

    return (
        <article className={styles.post}>
            <header className={styles.topo}>
                {instituicao.imagem
                    ? <img src={instituicao.imagem} alt="" className={styles.avatar} />
                    : <div className={styles.avatar} />}
                <div>
                    <strong className={styles.nome}>{instituicao.nome}</strong>
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

            <p className={styles.texto}>{post.texto && <p className={styles.texto}>{post.texto}</p>}</p>

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
                <button type="button" className={styles.botao}>Comentar</button>
                <button type="button" className={styles.botao}>Compartilhar</button>
            </footer>
        </article>
    );
}

export default Postagem;