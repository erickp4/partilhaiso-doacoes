import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cabecalho from '../../componentes/Cabecalho';
import CampoSenha from '../../componentes/CampoSenha';
import Rodape from '../../componentes/Rodape';
import styles from './CadastroInstitucional.module.css';

function CadastroInstitucional(){
    const navigate = useNavigate();
    const [tipoDoc, setTipoDoc] = useState('CPF');
    const [erro, setErro] = useState('');

    // Um único useState guarda todos os campos do formulário
    const [dados, setDados] = useState({
        nome: '',
        documento: '',
        responsavel: '',
        email: '',
        telefone: '',
        senha: '',
        confirmacao: ''
    });

    // O "name" de cada input diz qual campo do objeto deve ser atualizado
    function alterar(evento){
        setDados({ ...dados, [evento.target.name]: evento.target.value });
    }

    function trocarDocumento(tipo){
        setTipoDoc(tipo);
        setDados({ ...dados, documento: '' });
    }

    function enviar(evento){
        evento.preventDefault();

        if (dados.senha !== dados.confirmacao){
            setErro('As senhas não são iguais.');
            return;
        }

        setErro('');
        console.log('Cadastro:', tipoDoc, dados); // por enquanto só mostra no console
    }

    return (
        <div className={styles.pagina}>
            <Cabecalho mostrarLogin={false} />

            <main className={styles.principal}>
                <div className={styles.topo}>
                    <button
                        className={styles.voltar}
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        ←
                    </button>
                    <h1 className={styles.titulo}>
                        Vamos fazer seu cadastro institucional
                    </h1>
                </div>

                <form className={styles.formulario} onSubmit={enviar}>
                    <div className={styles.campo}>
                        <label htmlFor="nome">Nome da instituição</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            placeholder="Insira o nome da instituição"
                            value={dados.nome}
                            onChange={alterar}
                            required
                        />
                        <p className={styles.dica}>
                            Esse nome aparecerá nas páginas públicas do site.
                            É possível alterá-lo a qualquer momento
                        </p>
                    </div>

                    <div className={styles.campo}>
                        <div className={styles.abas}>
                            {['CPF', 'CNPJ'].map((tipo) => (
                                <button
                                    key={tipo}
                                    type="button"
                                    className={`${styles.aba} ${tipoDoc === tipo ? styles.abaAtiva : ''}`}
                                    onClick={() => trocarDocumento(tipo)}
                                >
                                    {tipo}
                                </button>
                            ))}
                        </div>
                        <input
                            id="documento"
                            name="documento"
                            type="text"
                            placeholder={
                                tipoDoc === 'CPF'
                                    ? 'Insira o CPF do responsável'
                                    : 'Insira o CNPJ da instituição'
                            }
                            value={dados.documento}
                            onChange={alterar}
                            required
                        />
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="responsavel">Nome Completo</label>
                        <input
                            id="responsavel"
                            name="responsavel"
                            type="text"
                            placeholder="Insira o nome completo do responsável"
                            value={dados.responsavel}
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
                            placeholder="Email institucional ou do responsável"
                            value={dados.email}
                            onChange={alterar}
                            required
                        />
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="telefone">Telefone (WhatsApp)</label>
                        <input
                            id="telefone"
                            name="telefone"
                            type="tel"
                            placeholder="(00) 00000 0000"
                            value={dados.telefone}
                            onChange={alterar}
                            required
                        />
                    </div>

                    <CampoSenha
                        id="senha"
                        rotulo="Senha"
                        placeholder="Insira uma senha"
                        value={dados.senha}
                        onChange={alterar}
                    />

                    <CampoSenha
                        id="confirmacao"
                        rotulo="Confirmação da senha"
                        placeholder="Repita a senha"
                        value={dados.confirmacao}
                        onChange={alterar}
                    />

                    {erro && <p className={styles.erro}>{erro}</p>}

                    <button type="submit" className={styles.criar}>Criar conta</button>

                    <Link to="/login" className={styles.jaTenho}>Já tenho conta</Link>
                </form>
            </main>

            <Rodape />
        </div>
    );
}

export default CadastroInstitucional;