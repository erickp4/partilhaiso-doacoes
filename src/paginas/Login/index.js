import { useState } from 'react';
import logo from '../../componentes/Cabecalho/logo.png';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';

function Login(){
    // useState guarda o que a pessoa digita em cada campo
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    function enviar(evento){
        evento.preventDefault();
        navigate('/feed'); // por enquanto entra direto, sem verificar a senha
    }   
    return (
        <div className={styles.pagina}>
            <aside className={styles.lateral}>
                <Link to="/">
                    <img src={logo} alt="Logo Partilhaiso" className={styles.logo} />
                </Link>

                <nav>
                    <Link to="/login" className={styles.botaoLogin}>Log in</Link>
                    <ul className={styles.subitens}>
                        <li>
                            <Link to="/cadastro-institucional">
                                🏛️ Cadastrar conta institucional
                            </Link>
                        </li>
                        <li>
                            <Link to="/cadastro-pessoal">
                                👤 Cadastrar conta pessoal
                            </Link>
                        </li>
                    </ul>
                </nav>

                <nav className={styles.menu}>
                    <Link to="/instituicoes">Instituições</Link>
                    <Link to="/sobre">Quem somos</Link>
                </nav>
            </aside>

            <main className={styles.principal}>
                <h1 className={styles.titulo}>Bem-vindo!</h1>

                <form className={styles.formulario} onSubmit={enviar}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Insira seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        placeholder="Insira sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <Link to="/recuperar-senha" className={styles.esqueci}>
                        Esqueci minha senha
                    </Link>

                    <button type="submit" className={styles.entrar}>Entrar</button>

                    <span className={styles.ou}>ou</span>

                    <button type="button" className={styles.google}>
                        <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/>
                            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.500-.8-3.100-.8-4.700s.3-3.200.8-4.700l-7.900-6.100C.9 16.500 0 20.100 0 24s.9 7.500 2.600 10.800l7.900-6.100z"/>
                            <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.600-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4-13.500-9.700l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/>
                        </svg>
                        Entrar com o Google
                    </button>
                </form>
            </main>
        </div>
    );
}

export default Login;