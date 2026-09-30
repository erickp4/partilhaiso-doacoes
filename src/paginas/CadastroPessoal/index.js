import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cabecalho from '../../componentes/Cabecalho';
import CampoSenha from '../../componentes/CampoSenha';
import Rodape from '../../componentes/Rodape';
// Reaproveita o CSS da outra página, já que o visual é o mesmo
import styles from '../CadastroInstitucional/CadastroInstitucional.module.css';

function CadastroPessoal(){
    const navigate = useNavigate();
    const [erro, setErro] = useState('');

    const [dados, setDados] = useState({
        perfil: '',
        nome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmacao: ''
    });

    function alterar(evento){
        setDados({ ...dados, [evento.target.name]: evento.target.value });
    }

    function enviar(evento){
        evento.preventDefault();

        if (dados.senha !== dados.confirmacao){
            setErro('As senhas não são iguais.');
            return;
        }

        setErro('');
        console.log('Cadastro pessoal:', dados); // por enquanto só mostra no console
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
                        Vamos fazer seu cadastro pessoal
                    </h1>
                </div>

                <form className={styles.formulario} onSubmit={enviar}>
                    <div className={styles.campo}>
                        <label htmlFor="perfil">Nome de perfil</label>
                        <input
                            id="perfil"
                            name="perfil"
                            type="text"
                            placeholder="Insira um nome"
                            value={dados.perfil}
                            onChange={alterar}
                            required
                        />
                        <p className={styles.dica}>
                            Esse nome aparecerá nas páginas públicas do site.
                            É possível alterá-lo a qualquer momento
                        </p>
                    </div>

                    <div className={styles.campo}>
                        <label htmlFor="nome">Nome Completo</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            placeholder="Insira o nome completo"
                            value={dados.nome}
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
                            placeholder="Insira seu melhor email"
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

export default CadastroPessoal;