import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FazerPedidos.module.css';

const API = 'http://localhost:3001';

// Interruptor: vermelho = desligado, verde = ligado
function Interruptor({ ligado, onChange, nome }){
    return (
        <button
            type="button"
            role="switch"
            aria-checked={ligado}
            aria-label={`Pedido de ${nome}`}
            className={`${styles.interruptor} ${ligado ? styles.ligado : ''}`}
            onClick={onChange}
        >
            <span className={styles.bolinha} />
        </button>
    );
}

function FazerPedidos(){
    const navigate = useNavigate();

    const [instituicaoId, setInstituicaoId] = useState(null);
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [semPermissao, setSemPermissao] = useState(false);
    const [erro, setErro] = useState('');

    // Campos do formulário "Pedir novo item"
    const [novoNome, setNovoNome] = useState('');
    const [novaQtd, setNovaQtd] = useState('1');

    // Carrega os itens atuais da instituição da pessoa logada
    useEffect(() => {
        fetch(`${API}/usuario`)
            .then(r => r.json())
            .then(usuario => {
                // Só quem tem uma instituição pode fazer pedidos
                if (!usuario.instituicaoId){
                    setSemPermissao(true);
                    setCarregando(false);
                    return;
                }

                setInstituicaoId(usuario.instituicaoId);

                return fetch(`${API}/instituicoes/${usuario.instituicaoId}`)
                    .then(r => r.json())
                    .then(inst => {
                        setItens(inst.itens || []);
                        setCarregando(false);
                    });
            })
            .catch(() => {
                setErro('Não foi possível carregar os dados. O json-server está rodando?');
                setCarregando(false);
            });
    }, []);

    // Atualiza a tela e grava a lista inteira de itens no db.json
    async function salvarItens(lista){
        setItens(lista);
        setErro('');

        try {
            const resposta = await fetch(`${API}/instituicoes/${instituicaoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itens: lista })
            });

            if (!resposta.ok) throw new Error('falhou');
        } catch {
            setErro('Não foi possível salvar. O json-server está rodando?');
        }
    }

    // Liga ou desliga um item (item sem o campo "ativo" conta como ligado)
    function alternar(indice){
        salvarItens(
            itens.map((item, i) =>
                i === indice ? { ...item, ativo: item.ativo === false } : item
            )
        );
    }

        // Liga ou desliga a prioridade (o item fica vermelho no perfil)
    function alternarPrioridade(indice){
        salvarItens(
            itens.map((item, i) =>
                i === indice ? { ...item, urgente: !item.urgente } : item
            )
        );
    }

    // Apaga o item da lista, depois de confirmar
    function excluir(indice){
        const item = itens[indice];

        if (!window.confirm(`Excluir "${item.nome}" da lista de pedidos?`)) return;

        salvarItens(itens.filter((_, i) => i !== indice));
    }

    // Enquanto digita, só muda na tela (não grava a cada letra)
    function digitar(indice, campo, valor){
        setItens(itens.map((item, i) =>
            i === indice ? { ...item, [campo]: valor } : item
        ));
    }

    // Ao sair do campo, converte para número e grava
    function terminarDigitacao(){
        salvarItens(itens.map(item => ({
            ...item,
            atual: Number(item.atual) || 0,
            meta: Number(item.meta) || 0
        })));
    }

    async function criar(evento){
        evento.preventDefault();

        const nome = novoNome.trim();
        const quantidade = Number(novaQtd);

        if (!nome){
            setErro('Digite o nome do item.');
            return;
        }
        if (!quantidade || quantidade < 1){
            setErro('A quantidade precisa ser pelo menos 1.');
            return;
        }
        if (itens.some(item => item.nome.toLowerCase() === nome.toLowerCase())){
            setErro('Esse item já existe na lista.');
            return;
        }

        const novoItem = { nome, icone: '📦', atual: 0, meta: quantidade, ativo: true };
        await salvarItens([...itens, novoItem]);

        setNovoNome('');
        setNovaQtd('1');
    }

    if (carregando){
        return <p className={styles.aviso}>Carregando...</p>;
    }

    if (semPermissao){
        return <p className={styles.aviso}>Somente instituições podem fazer pedidos.</p>;
    }

    // Guarda a posição original de cada item (para ligar, excluir etc. continuarem
    // mexendo no item certo) e coloca os ativos primeiro
    const listaOrdenada = itens
        .map((item, indice) => ({ item, indice }))
        .sort((a, b) => Number(a.item.ativo === false) - Number(b.item.ativo === false));



    return (
        <div className={styles.pagina}>
            <div className={styles.cartao}>
                <header className={styles.topo}>
                    <button
                        type="button"
                        className={styles.voltar}
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className={styles.titulo}>Fazer pedidos</h1>
                        <p className={styles.subtitulo}>
                            Os pedidos realizados aqui aparecerão publicamente
                            no perfil da instituição
                        </p>
                    </div>
                </header>

                {erro && <p className={styles.erro}>{erro}</p>}

                <div className={styles.colunas}>
                    {/* ---------- Esquerda: novo item ---------- */}
                    <section className={styles.esquerda}>
                        <form className={styles.novo} onSubmit={criar}>
                            <h2>Pedir novo item</h2>

                            <div className={styles.campo}>
                                <label htmlFor="nome">Nome</label>
                                <input
                                    id="nome"
                                    type="text"
                                    placeholder="Materiais de limpeza"
                                    value={novoNome}
                                    onChange={(e) => setNovoNome(e.target.value)}
                                />
                            </div>

                            <div className={styles.campo}>
                                <label htmlFor="quantidade">Quantidade</label>
                                <input
                                    id="quantidade"
                                    type="number"
                                    min="1"
                                    className={styles.pequeno}
                                    value={novaQtd}
                                    onChange={(e) => setNovaQtd(e.target.value)}
                                />
                            </div>

                            <button type="submit" className={styles.criar}>Criar</button>
                        </form>
                    </section>

                    {/* ---------- Direita: gestão de pedidos ---------- */}
                    <section className={styles.direita}>
                        <h2>Gestão de pedidos</h2>

                        {itens.length === 0 && (
                            <p className={styles.vazio}>
                                Nenhum item ainda. Crie o primeiro ao lado.
                            </p>
                        )}

                        {listaOrdenada.map(({ item, indice }) => {
                            const ligado = item.ativo !== false;

                            return (
                                <div key={item.nome} className={styles.linha}>
                                    <div className={`${styles.item} ${!ligado ? styles.desativado : ''}`}>
                                        <span>{item.nome}</span>

                                        <div className={styles.botoes}>
                                            {/* Prioridade só existe para itens ativos */}
                                            {ligado && (
                                                <button
                                                    type="button"
                                                    className={`${styles.iconeBotao} ${item.urgente ? styles.prioridadeAtiva : ''}`}
                                                    onClick={() => alternarPrioridade(indice)}
                                                    title={item.urgente ? 'Tirar prioridade' : 'Marcar como prioridade'}
                                                    aria-label={item.urgente ? 'Tirar prioridade' : 'Marcar como prioridade'}
                                                    aria-pressed={Boolean(item.urgente)}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24"
                                                        fill={item.urgente ? 'currentColor' : 'none'}
                                                        stroke="currentColor" strokeWidth="2"
                                                        strokeLinejoin="round">
                                                        <path d="M12 2l3.100 6.300 6.900 1-5 4.900 1.200 6.900L12 17.800 5.800 21.100 7 14.200 2 9.300l6.900-1z" />
                                                    </svg>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className={`${styles.iconeBotao} ${styles.excluir}`}
                                                onClick={() => excluir(indice)}
                                                title="Excluir item"
                                                aria-label={`Excluir ${item.nome}`}
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
                                        </div>

                                        <Interruptor
                                            ligado={ligado}
                                            nome={item.nome}
                                            onChange={() => alternar(indice)}
                                        />
                                    </div>

                                    {/* As quantidades só aparecem com o item ligado */}
                                    {ligado && (
                                        <div className={styles.quantidades}>
                                            <label>
                                                <small>Qtd recebida</small>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    placeholder="0"
                                                    value={item.atual ?? ''}
                                                    onChange={(e) => digitar(indice, 'atual', e.target.value)}
                                                    onBlur={terminarDigitacao}
                                                />
                                            </label>
                                            <label>
                                                <small>Qtd esperada</small>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    placeholder="0"
                                                    value={item.meta ?? ''}
                                                    onChange={(e) => digitar(indice, 'meta', e.target.value)}
                                                    onBlur={terminarDigitacao}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default FazerPedidos;