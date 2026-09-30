import { Link } from 'react-router-dom';
import Cabecalho from '../../componentes/Cabecalho';
import Rodape from '../../componentes/Rodape';
import styles from './Inicio.module.css';

function Inicio(){
    return (
        <div className={styles.pagina}>
            <Cabecalho />
            <main className={styles.principal}>
                <h1 className={styles.titulo}>
                    Ajude-nos a levar o paraíso para quem mais precisa.
                </h1>
                <Link to="/instituicoes" className={styles.botao}>
                    Quero ajudar uma instituição!
                </Link>
                {/* Troque esta div por <img src={foto} alt="..." /> quando tiver a foto */}
                <div className={styles.foto}>Foto</div>
            </main>
            <Rodape />
        </div>
    );
}

export default Inicio;