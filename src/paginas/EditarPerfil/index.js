import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EditarPerfil.module.css';

const API = 'http://localhost:3001';

// Botão "sim | não". O lado escolhido fica cinza, como no design
function SimNao({ valor, onChange }){
    return (
        <div className={styles.simNao}>
            <button
                type="button"
                className={valor ? styles.escolhido : ''}
                onClick={() => onChange(true)}
            >
                sim
            </button>
            <button
                type="button"
                className={!valor ? styles.escolhido : ''}
                onClick={() => onChange(false)}
            >
                não
            </button>
        </div>
    );
}

// Diminui a foto antes de guardar, para o db.json não ficar gigante
function reduzirImagem(arquivo, tamanhoMax = 300){
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onerror = reject;
        leitor.onload = () => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const escala = Math.min(1, tamanhoMax / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = img.width * escala;
                canvas.height = img.height * escala;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = leitor.result;
        };
        leitor.readAsDataURL(arquivo);
    });
}

function EditarPerfil(){
    const navigate = useNavigate();
    const inputFoto = useRef(null);

    const [instituicaoId, setInstituicaoId] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [semPermissao, setSemPermissao] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    // Um único useState guarda todos os campos do formulário
    const [form, setForm] = useState({
        imagem: '',
        nome: '',
        email: '',
        pix: '',
        endereco: '',
        numero: '',
        voluntariosAtivo: false,
        voluntariosTexto: '',
        sobre: '',
        metaAtiva: false,
        metaAtual: '',
        metaTotal: ''
    });

    // Preenche o formulário com os dados atuais da instituição
    useEffect(() => {
        fetch(`${API}/usuario`)
            .then(r => r.json())
            .then(usuario => {
                // Só quem tem uma instituição pode editar um perfil
                if (!usuario.instituicaoId){
                    setSemPermissao(true);
                    setCarregando(false);
                    return;
                }

                setInstituicaoId(usuario.instituicaoId);

                return fetch(`${API}/instituicoes/${usuario.instituicaoId}`)
                    .then(r => r.json())
                    .then(inst => {
                        setForm({
                            imagem: inst.imagem || '',
                            nome: inst.nome || '',
                            email: inst.email || '',
                            pix: inst.pix || '',
                            endereco: inst.endereco || '',
                            numero: inst.numero || '',
                            voluntariosAtivo: inst.voluntarios?.ativo || false,
                            voluntariosTexto: inst.voluntarios?.texto || '',
                            sobre: inst.sobre || '',
                            metaAtiva: Boolean(inst.meta),
                            metaAtual: inst.meta?.atual ?? '',
                            metaTotal: inst.meta?.total ?? ''
                        });
                        setCarregando(false);
                    });
            })
            .catch(() => {
                setErro('Não foi possível carregar os dados. O json-server está rodando?');
                setCarregando(false);
            });
    }, []);

    // Atualiza um campo de texto usando o "name" do input
    function alterar(evento){
        setForm({ ...form, [evento.target.name]: evento.target.value });
    }

    // Atualiza um campo direto (usado pelos botões sim/não)
    function definir(campo, valor){
        setForm({ ...form, [campo]: valor });
    }

    async function escolherFoto(evento){
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        try {
            const imagem = await reduzirImagem(arquivo);
            definir('imagem', imagem);
        } catch {
            setErro('Não foi possível usar essa imagem.');
        }
    }

    async function salvar(evento){
        evento.preventDefault();
        setErro('');

        if (form.metaAtiva && Number(form.metaTotal) <= 0){
            setErro('Informe o valor da meta financeira.');
            return;
        }

        setSalvando(true);

        const corpo = {
            imagem: form.imagem,
            nome: form.nome,
            email: form.email,
            pix: form.pix,
            endereco: form.endereco,
            numero: form.numero,
            sobre: form.sobre,
            voluntarios: {
                ativo: form.voluntariosAtivo,
                texto: form.voluntariosTexto
            },
            // Se a meta estiver desligada, ela é removida do perfil
            meta: form.metaAtiva
                ? { atual: Number(form.metaAtual) || 0, total: Number(form.metaTotal) }
                : null
        };

        try {
            // PATCH altera só os campos enviados, sem apagar o resto da instituição
            const resposta = await fetch(`${API}/instituicoes/${instituicaoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpo)
            });

            if (!resposta.ok) throw new Error('falhou');

            navigate(`/instituicao/${instituicaoId}`);
        } catch {
            setErro('Não foi possível salvar. O json-server está rodando?');
            setSalvando(false);
        }
    }

    if (carregando){
        return <p className={styles.aviso}>Carregando...</p>;
    }

    if (semPermissao){
        return <p className={styles.aviso}>Somente instituições podem editar um perfil.</p>;
    }

    return (
        <div className={styles.pagina}>
            <form className={styles.cartao} onSubmit={salvar}>
                {/* ---------- Parte de cima ---------- */}
                <section className={styles.secao}>
                    <div className={styles.topo}>
                        <button
                            type="button"
                            className={styles.voltar}
                            onClick={() => navigate(-1)}
                            aria-label="Voltar"
                        >
                            ←
                        </button>
                        <h1 className={styles.titulo}>Editar perfil</h1>
                    </div>

                    <div className={styles.foto}>
                        {form.imagem
                            ? <img src={form.imagem} alt="" className={styles.avatar} />
                            : <div className={styles.avatar} />}

                        <input
                            type="file"
                            accept="image/*"
                            ref={inputFoto}
                            onChange={escolherFoto}
                            hidden
                        />
                        <button
                            type="button"
                            className={styles.editarFoto}
                            onClick={() => inputFoto.current.click()}
                        >
                            Editar foto
                        </button>
                    </div>

                    <div className={styles.colunas}>
                        <div>
                            <div className={styles.campo}>
                                <label htmlFor="nome">Nome</label>
                                <input
                                    id="nome"
                                    name="nome"
                                    type="text"
                                    placeholder="Nome"
                                    value={form.nome}
                                    onChange={alterar}
                                    required
                                />
                            </div>

                            <div className={styles.campo}>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="instituicao@gmail.com"
                                    value={form.email}
                                    onChange={alterar}
                                />
                            </div>

                            <div className={styles.campo}>
                                <label htmlFor="pix">Chave pix para receber doações</label>
                                <input
                                    id="pix"
                                    name="pix"
                                    type="text"
                                    placeholder="Chave pix"
                                    value={form.pix}
                                    onChange={alterar}
                                />
                            </div>
                        </div>

                        <div>
                            <div className={styles.endereco}>
                                <div className={styles.campo}>
                                    <label htmlFor="endereco">Endereço</label>
                                    <input
                                        id="endereco"
                                        name="endereco"
                                        type="text"
                                        placeholder="Rua Alecrim Dourado"
                                        value={form.endereco}
                                        onChange={alterar}
                                    />
                                </div>
                                <div className={styles.campo}>
                                    <label htmlFor="numero">Número</label>
                                    <input
                                        id="numero"
                                        name="numero"
                                        type="text"
                                        placeholder="35"
                                        value={form.numero}
                                        onChange={alterar}
                                    />
                                </div>
                            </div>

                            <div className={styles.campo}>
                                <div className={styles.rotuloComToggle}>
                                    <label htmlFor="voluntariosTexto">Convocar voluntários</label>
                                    <SimNao
                                        valor={form.voluntariosAtivo}
                                        onChange={(v) => definir('voluntariosAtivo', v)}
                                    />
                                </div>
                                <p className={styles.nota}>
                                    Neste campo, informe ao voluntário qual será a função
                                    dele na instituição
                                </p>
                                <div className={styles.areaTexto}>
                                    <textarea
                                        id="voluntariosTexto"
                                        name="voluntariosTexto"
                                        placeholder="Precisamos de voluntários para ajudar os idosos na parte da manhã"
                                        maxLength={150}
                                        value={form.voluntariosTexto}
                                        onChange={alterar}
                                        disabled={!form.voluntariosAtivo}
                                        rows={4}
                                    />
                                    <span className={styles.contador}>
                                        limite de caracteres {form.voluntariosTexto.length}/150
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- Parte de baixo ---------- */}
                <section className={`${styles.secao} ${styles.baixo}`}>
                    <div className={styles.colunas}>
                        <div className={styles.campo}>
                            <label htmlFor="sobre">Sobre a instituição</label>
                            <div className={styles.areaTexto}>
                                <textarea
                                    id="sobre"
                                    name="sobre"
                                    placeholder="Fale um pouco sobre a instituição..."
                                    maxLength={250}
                                    value={form.sobre}
                                    onChange={alterar}
                                    rows={9}
                                />
                                <span className={styles.contador}>
                                    limite de caracteres {form.sobre.length}/250
                                </span>
                            </div>
                        </div>

                        <div className={styles.campo}>
                            <div className={styles.rotuloComToggle}>
                                <label>Meta financeira</label>
                                <SimNao
                                    valor={form.metaAtiva}
                                    onChange={(v) => definir('metaAtiva', v)}
                                />
                            </div>
                            <p className={styles.nota}>
                                Você pode adicionar no perfil da instituição uma meta
                                financeira de doações
                            </p>

                            <div className={styles.valores}>
                                <div>
                                    <label htmlFor="metaAtual">Quantidade</label>
                                    <input
                                        id="metaAtual"
                                        name="metaAtual"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="R$ 0,00"
                                        value={form.metaAtual}
                                        onChange={alterar}
                                        disabled={!form.metaAtiva}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="metaTotal">Quantidade</label>
                                    <input
                                        id="metaTotal"
                                        name="metaTotal"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="R$ 0,00"
                                        value={form.metaTotal}
                                        onChange={alterar}
                                        disabled={!form.metaAtiva}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {erro && <p className={styles.erro}>{erro}</p>}

                    <div className={styles.acoes}>
                        <button type="submit" className={styles.salvar} disabled={salvando}>
                            {salvando ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </section>
            </form>
        </div>
    );
}

export default EditarPerfil;