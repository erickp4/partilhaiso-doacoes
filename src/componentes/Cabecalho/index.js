import { Link } from "react-router-dom";
import logo from './logo.png';
import styles from './Cabecalho.module.css';
import CabecalhoLink from "../CabecalhoLink";

function Cabecalho({ mostrarLogin = true }){
    return(
        <header className={styles.cabecalho}>
            <Link to="/">
                <img src={logo} alt="Logo Partilhaiso" />
            </Link>
            {mostrarLogin && (
                <Link to="/login" className={styles.botaoLogin}>Log in</Link>
            )}
            <nav className={styles.menu}>
                <CabecalhoLink url="/instituicoes">Instituições</CabecalhoLink>
                <CabecalhoLink url="/sobre">Quem somos</CabecalhoLink>
                <Link to="/login" className={styles.botaoLogin}>Log in</Link>
                
            </nav>
        </header>
    );
}

export default Cabecalho;