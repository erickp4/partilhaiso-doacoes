import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { gerarPix } from '../../utilitarios/pix';
import styles from './Doacao.module.css';

const API = 'http://localhost:3001';

function Doacao({ instituicao, item, onFechar }){
    const [mensagem, setMensagem] = useState(
        item && !item.dinheiro ? `Olá! Gostaria de doar: ${item.nome}.` : ''
    );
    const [copiado, setCopiado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [concluido, setConcluido] = useState(false);
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

    const temPix = Boolean(instituicao.pix && instituicao.pix.trim());
    const codigo = temPix ? gerarPix({ chave: instituicao.pix, nome: instituicao.nome }) : '';

    async function copiar(){
        try {
            await navigator.clipboard.writeText(codigo);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            setErro('Não foi possível copiar o código.');
        }
    }

    async function doar(evento){
        evento.preventDefault();
        setErro('');
        setEnviando(true);

        try {
            const usuario = await fetch(`${API}/usuario`).then(r => r.json());

            const resposta = await fetch(`${API}/doacoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instituicaoId: instituicao.id,
                    doador: usuario.nome || '',
                    mensagem: mensagem.trim(),
                    criadoEm: Date.now(),
                    item: item ? item.nome : '',
                })
            });

            if (!resposta.ok) throw new Error('falhou');

            setConcluido(true);
        } catch {
            setErro('Não foi possível registrar. O json-server está rodando?');
            setEnviando(false);
        }
    }

    return createPortal(
        <div className={styles.fundo}>
            <div
                className={styles.janela}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-doacao"
            >
                <header className={styles.cabecalho}>
                    <h2 id="titulo-doacao">Doação</h2>
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

                {concluido ? (
                    <div className={styles.final}>
                        <p className={styles.obrigado}>Obrigado pela doação! 💚</p>
                        <p>
                            Sua mensagem foi enviada para <strong>{instituicao.nome}</strong>.
                        </p>
                        <button type="button" className={styles.doar} onClick={onFechar}>
                            Fechar
                        </button>
                    </div>
                ) : !temPix ? (
                    <div className={styles.final}>
                        <p>Esta instituição ainda não cadastrou uma chave pix.</p>
                        <button type="button" className={styles.cancelar} onClick={onFechar}>
                            Fechar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={doar}>
                        <div className={styles.pix}>
                            <p className={styles.nome}>
                                Nome: {instituicao.nome} (importante verificar)
                            </p>
                            {item && (
                                <p className={styles.itemEscolhido}>Item escolhido: {item.nome}</p>
                            )}

                            <div className={styles.qr}>
                                <QRCodeSVG value={codigo} size={150} />
                            </div>

                            <button type="button" className={styles.copiar} onClick={copiar}>
                                {copiado ? 'Copiado!' : 'Copia e Cola'}
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="1.8"
                                     strokeLinejoin="round" aria-hidden="true">
                                    <rect x="8" y="8" width="12" height="12" rx="1" />
                                    <path d="M16 8V4H4v12h4" />
                                </svg>
                            </button>

                            <p className={styles.instrucao}>
                                Pague pelo app do seu banco e depois clique em Doar
                                para avisar a instituição.
                            </p>
                        </div>

                        <div className={styles.mensagem}>
                            <label htmlFor="mensagem">Mensagem</label>
                            <textarea
                                id="mensagem"
                                placeholder="Escreva uma mensagem para a instituição (opcional)..."
                                maxLength={300}
                                rows={5}
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                            />

                            {erro && <p className={styles.erro}>{erro}</p>}

                            <div className={styles.acoes}>
                                <button type="button" className={styles.cancelar} onClick={onFechar}>
                                    Cancelar
                                </button>
                                <button type="submit" className={styles.doar} disabled={enviando}>
                                    {enviando ? 'Enviando...' : 'Doar'}
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

export default Doacao;