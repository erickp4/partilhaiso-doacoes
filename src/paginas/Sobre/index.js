import { useNavigate } from 'react-router-dom';
import Rodape from '../../componentes/Rodape';
import styles from './Sobre.module.css';

function Sobre(){
    // useNavigate permite voltar para a página anterior
    const navigate = useNavigate();

    return (
        <div className={styles.pagina}>
            <div className={styles.topo}>
                <button
                    className={styles.voltar}
                    onClick={() => navigate(-1)}
                    aria-label="Voltar"
                >
                    ←
                </button>
                <h1 className={styles.titulo}>Quem somos?</h1>
            </div>

            <main className={styles.principal}>
                <section className={styles.cartao}>
                    <p>
                        <strong className={styles.destaque}>Partilhaíso</strong> foi
                        desenvolvido durante a disciplina de Projeto Integrador 2 no
                        campus Paraíso da UFLA (Universidade Federal de Lavras), como
                        uma forma de retribuir à sociedade o investimento feito por
                        meio dos impostos.
                    </p>
                    <p>
                        Nosso objetivo é reunir em um só lugar todas as instituições
                        beneficentes de São Sebastião do Paraíso, permitindo que
                        doadores encontrem com facilidade e segurança o que, para quem
                        e onde doar.
                    </p>
                    <p>
                        Todas as instituições da cidade estão convidadas a fazer
                        parte! A plataforma é totalmente gratuita — pedimos apenas o
                        seu apoio na divulgação para alcançarmos mais doadores.
                    </p>
                    <p>
                        Teve alguma dificuldade para cadastrar sua instituição? Fale
                        com a nossa equipe de desenvolvimento:
                    </p>
                    <a
                        className={styles.email}
                        href="mailto:ana.ribeiro21@estudante.ufla.br"
                    >
                        ana.ribeiro21@estudante.ufla.br
                    </a>
                    <p className={styles.assinatura}>Abraços.</p>
                </section>
            </main>

            <Rodape />
        </div>
    );
}

export default Sobre;