import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reduzirImagem } from '../../utilitarios/reduzirImagem';
import styles from './Chat.module.css';

const API = 'http://localhost:3001';
const EMOJIS = ['😀', '😊', '😂', '😍', '🙏', '👍', '👏', '❤️', '🎉', '😢', '😮', '🤝'];
const TRINTA_MINUTOS = 30 * 60 * 1000;

function mesmoDia(a, b){
    return a.toDateString() === b.toDateString();
}

// Transforma a data guardada em "Hoje, 08:23", "Ontem, 22:03" ou "27/09, 10:00"
function rotuloData(iso){
    const data = new Date(iso);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (mesmoDia(data, hoje)) return `Hoje, ${hora}`;
    if (mesmoDia(data, ontem)) return `Ontem, ${hora}`;

    const dia = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${dia}, ${hora}`;
}

// Foto redonda, ou um círculo cinza quando não há foto
function Avatar({ imagem, className }){
    return imagem
        ? <img src={imagem} alt="" className={className} />
        : <div className={className} />;
}

function Chat(){
    const navigate = useNavigate();
    const fimDasMensagens = useRef(null);
    const inputFoto = useRef(null);
    const campoTexto = useRef(null);

    const [conversas, setConversas] = useState([]);
    const [conversaId, setConversaId] = useState(null);
    const [mensagens, setMensagens] = useState([]);
    const [texto, setTexto] = useState('');
    const [imagem, setImagem] = useState('');
    const [emojisAbertos, setEmojisAbertos] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Carrega a lista de conversas e abre a primeira
    useEffect(() => {
        fetch(`${API}/conversas`)
            .then(r => {
                if (!r.ok) throw new Error('falhou');
                return r.json();
            })
            .then(lista => {
                setConversas(lista);
                if (lista.length > 0) setConversaId(lista[0].id);
                setCarregando(false);
            })
            .catch(() => {
                setErro('Não foi possível carregar as conversas. O json-server está rodando?');
                setCarregando(false);
            });
    }, []);

    // Sempre que a conversa aberta muda, busca as mensagens dela
    useEffect(() => {
        if (conversaId === null) return;

        setMensagens([]);
        fetch(`${API}/mensagens?conversaId=${conversaId}&_sort=enviadoEm&_order=asc`)
            .then(r => r.json())
            .then(lista => setMensagens(Array.isArray(lista) ? lista : []))
            .catch(() => setErro('Não foi possível carregar as mensagens.'));
    }, [conversaId]);

    // Rola para a mensagem mais recente
    useEffect(() => {
        fimDasMensagens.current?.scrollIntoView({ block: 'end' });
    }, [mensagens]);

    function trocarConversa(id){
        setConversaId(id);
        setTexto('');
        setImagem('');
        setEmojisAbertos(false);
        setErro('');
    }

    function colocarEmoji(emoji){
        setTexto(texto + emoji);
        setEmojisAbertos(false);
        campoTexto.current.focus();
    }

    async function escolherFoto(evento){
        const arquivo = evento.target.files[0];
        evento.target.value = ''; // permite escolher a mesma foto de novo
        if (!arquivo) return;

        try {
            setImagem(await reduzirImagem(arquivo, 800));
        } catch {
            setErro('Não foi possível usar essa imagem.');
        }
    }

    async function enviar(evento){
        evento.preventDefault();

        const conteudo = texto.trim();
        if (!conteudo && !imagem) return;

        try {
            const resposta = await fetch(`${API}/mensagens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversaId,
                    de: 'eu',
                    texto: conteudo,
                    imagem,
                    enviadoEm: new Date().toISOString()
                })
            });

            if (!resposta.ok) throw new Error('falhou');

            const salva = await resposta.json();
            setMensagens([...mensagens, salva]);
            setTexto('');
            setImagem('');
            setErro('');
        } catch {
            setErro('Não foi possível enviar. O json-server está rodando?');
        }
    }

    const conversa = conversas.find(c => c.id === conversaId);

    return (
        <div className={styles.pagina}>
            {/* ---------- Coluna da esquerda: lista de conversas ---------- */}
            <aside className={styles.lateral}>
                <header className={styles.topo}>
                    <button
                        type="button"
                        className={styles.voltar}
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        ←
                    </button>
                    <h1 className={styles.titulo}>Chat</h1>
                </header>

                <ul className={styles.lista}>
                    {conversas.map(c => (
                        <li key={c.id}>
                            <button
                                type="button"
                                className={`${styles.contato} ${c.id === conversaId ? styles.selecionado : ''}`}
                                onClick={() => trocarConversa(c.id)}
                            >
                                <Avatar imagem={c.imagem} className={styles.avatar} />
                                {c.nome}
                            </button>
                        </li>
                    ))}
                </ul>

                {!carregando && conversas.length === 0 && !erro && (
                    <p className={styles.aviso}>Nenhuma conversa ainda.</p>
                )}
            </aside>

            {/* ---------- Coluna da direita: conversa aberta ---------- */}
            <section className={styles.principal}>
                <header className={`${styles.topo} ${styles.topoConversa}`}>
                    {conversa && (
                        <>
                            <Avatar imagem={conversa.imagem} className={styles.avatar} />
                            <h2 className={styles.nomeConversa}>{conversa.nome}</h2>
                        </>
                    )}
                    <button type="button" className={styles.info} aria-label="Informações da conversa">
                        i
                    </button>
                </header>

                <div className={styles.mensagens}>
                    {erro && <p className={styles.erro}>{erro}</p>}

                    {conversa && mensagens.length === 0 && !erro && (
                        <p className={styles.aviso}>Nenhuma mensagem ainda. Diga olá!</p>
                    )}

                    {mensagens.map((m, i) => {
                        const anterior = mensagens[i - 1];
                        // Mostra data e hora na primeira mensagem e depois de uma pausa longa
                        const mostrarData = !anterior ||
                            new Date(m.enviadoEm) - new Date(anterior.enviadoEm) > TRINTA_MINUTOS;

                        return (
                            <Fragment key={m.id}>
                                {mostrarData && (
                                    <p className={styles.data}>{rotuloData(m.enviadoEm)}</p>
                                )}
                                <div className={`${styles.balao} ${m.de === 'eu' ? styles.meu : styles.dele}`}>
                                    {m.imagem && (
                                        <img src={m.imagem} alt="Imagem enviada" className={styles.foto} />
                                    )}
                                    {m.texto && <p>{m.texto}</p>}
                                </div>
                            </Fragment>
                        );
                    })}

                    <div ref={fimDasMensagens} />
                </div>

                <form className={styles.entrada} onSubmit={enviar}>
                    {imagem && (
                        <div className={styles.previa}>
                            <img src={imagem} alt="Prévia da imagem" />
                            <button type="button" onClick={() => setImagem('')}>
                                Remover
                            </button>
                        </div>
                    )}

                    {emojisAbertos && (
                        <div className={styles.emojis}>
                            {EMOJIS.map(emoji => (
                                <button key={emoji} type="button" onClick={() => colocarEmoji(emoji)}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.campo}>
                        <button
                            type="button"
                            className={styles.icone}
                            onClick={() => setEmojisAbertos(!emojisAbertos)}
                            aria-label="Escolher emoji"
                        >
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                                <circle cx="12" cy="12" r="9.500" />
                                <circle cx="9" cy="10" r="0.800" fill="currentColor" />
                                <circle cx="15" cy="10" r="0.800" fill="currentColor" />
                                <path d="M7.500 14a5 5 0 0 0 9 0" />
                            </svg>
                        </button>

                        <input
                            ref={campoTexto}
                            type="text"
                            placeholder="mensagem..."
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            maxLength={500}
                            disabled={!conversa}
                        />

                        <button
                            type="button"
                            className={styles.icone}
                            onClick={() => inputFoto.current.click()}
                            aria-label="Enviar imagem"
                            disabled={!conversa}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="1.6"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="16" rx="2" />
                                <circle cx="9" cy="10" r="1.800" />
                                <path d="M3 17l5-4 4 3 3-2 6 4" />
                            </svg>
                        </button>

                        <input
                            type="file"
                            accept="image/*"
                            ref={inputFoto}
                            onChange={escolherFoto}
                            hidden
                        />
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Chat;