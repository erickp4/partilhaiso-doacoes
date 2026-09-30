import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { reduzirImagem } from '../../utilitarios/reduzirImagem';
import styles from './CriarPostagem.module.css';

const API = 'http://localhost:3001';

function CriarPostagem({ instituicaoId, onFechar, onPostou }){
    const inputArquivo = useRef(null);
    const [imagem, setImagem] = useState('');
    const [legenda, setLegenda] = useState('');
    const [arrastando, setArrastando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');

    // Enquanto o popup está aberto: Esc fecha e a página de trás não rola
    useEffect(() => {
        function aoApertar(evento){
            if (evento.key === 'Escape') onFechar();
        }

        document.addEventListener('keydown', aoApertar);
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', aoApertar);
            document.body.style.overflow = overflowAnterior;
        };
    }, [onFechar]);

    async function receberArquivo(arquivo){
        if (!arquivo) return;

        if (!arquivo.type.startsWith('image/')){
            setErro('Escolha um arquivo de imagem.');
            return;
        }

        try {
            setErro('');
            setImagem(await reduzirImagem(arquivo, 900));
        } catch {
            setErro('Não foi possível usar essa imagem.');
        }
    }

    function aoSoltar(evento){
        evento.preventDefault(); // sem isso o navegador abriria a foto em outra aba
        setArrastando(false);
        receberArquivo(evento.dataTransfer.files[0]);
    }

    async function postar(evento){
        evento.preventDefault();
        setErro('');

        if (!legenda.trim() && !imagem){
            setErro('Adicione uma foto ou escreva uma legenda.');
            return;
        }

        setEnviando(true);

        try {
            const resposta = await fetch(`${API}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instituicaoId,
                    criadoEm: Date.now(),
                    texto: legenda.trim(),
                    imagem
                })
            });

            if (!resposta.ok) throw new Error('falhou');

            onPostou(); // avisa a página para recarregar as publicações
            onFechar();
        } catch {
            setErro('Não foi possível postar. O json-server está rodando?');
            setEnviando(false);
        }
    }

    // createPortal desenha o popup direto no <body>, por cima de tudo
    return createPortal(
        <div className={styles.fundo}>
            <div
                className={styles.janela}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-postagem"
            >
                <header className={styles.cabecalho}>
                    <h2 id="titulo-postagem">Criar Postagem</h2>
                    <button
                        type="button"
                        className={styles.fechar}
                        onClick={onFechar}
                        aria-label="Fechar"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <line x1="4" y1="4" x2="20" y2="20" />
                            <line x1="20" y1="4" x2="4" y2="20" />
                        </svg>
                    </button>
                </header>

                {!instituicaoId ? (
                    <div className={styles.legenda}>
                        <p>Somente instituições podem publicar no feed.</p>
                        <div className={styles.acoes}>
                            <button type="button" className={styles.cancelar} onClick={onFechar}>
                                Fechar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={postar}>
                        <div className={styles.envio}>
                            <div
                                className={`${styles.zona} ${arrastando ? styles.zonaAtiva : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                                onDragLeave={() => setArrastando(false)}
                                onDrop={aoSoltar}
                            >
                                {imagem ? (
                                    <>
                                        <img src={imagem} alt="Prévia da foto" className={styles.previa} />
                                        <button
                                            type="button"
                                            className={styles.link}
                                            onClick={() => setImagem('')}
                                        >
                                            Remover foto
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <svg width="56" height="56" viewBox="0 0 24 24"
                                             fill="currentColor" aria-hidden="true">
                                            <path d="M19.350 10.040A7.490 7.490 0 0 0 12 4C9.110 4 6.600 5.640 5.350 8.040A5.994 5.994 0 0 0 0 14c0 3.310 2.690 6 6 6h13c2.760 0 5-2.240 5-5 0-2.640-2.050-4.780-4.650-4.960zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                        </svg>
                                        <p>Arraste e solte sua foto</p>
                                        <p className={styles.cinza}>
                                            Ou{' '}
                                            <button
                                                type="button"
                                                className={styles.link}
                                                onClick={() => inputArquivo.current.click()}
                                            >
                                                procure no seu computador
                                            </button>
                                        </p>
                                    </>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                ref={inputArquivo}
                                onChange={(e) => {
                                    const arquivo = e.target.files[0];
                                    e.target.value = ''; // permite escolher a mesma foto de novo
                                    receberArquivo(arquivo);
                                }}
                                hidden
                            />
                        </div>

                        <div className={styles.legenda}>
                            <label htmlFor="legenda">Legenda</label>
                            <textarea
                                id="legenda"
                                placeholder="Digite aqui a legenda da sua postagem..."
                                maxLength={500}
                                rows={7}
                                value={legenda}
                                onChange={(e) => setLegenda(e.target.value)}
                                autoFocus
                            />

                            {erro && <p className={styles.erro}>{erro}</p>}

                            <div className={styles.acoes}>
                                <button type="button" className={styles.cancelar} onClick={onFechar}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.postar} disabled={enviando}>
                                    {enviando ? 'Postando...' : 'Postar'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}

export default CriarPostagem;