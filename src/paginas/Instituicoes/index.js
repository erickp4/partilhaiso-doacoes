import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Rodape from '../../componentes/Rodape';
import styles from './Instituicoes.module.css';

// Tira acentos e deixa minúsculo, para "paraiso" achar "Paraíso"
function normalizar(texto){
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function Instituicoes(){
    const navigate = useNavigate();
    const [instituicoes, setInstituicoes] = useState([]);
    const [busca, setBusca] = useState('');
    const [erro, setErro] = useState(false);

    // Busca os dados do db.json uma vez, quando a página abre
    useEffect(() => {
        fetch('http://localhost:3001/instituicoes')
            .then(resposta => resposta.json())
            .then(dados => setInstituicoes(dados))
            .catch(() => setErro(true));
    }, []);

    // Só as instituições cujo nome contém o que foi digitado
    const filtradas = instituicoes.filter(item =>
        normalizar(item.nome).includes(normalizar(busca))
    );

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
                <h2 className={styles.tituloTopo}>Ajude uma instituição</h2>
            </div>

            <main className={styles.principal}>
                <h1 className={styles.titulo}>Para quem deseja doar?</h1>

                <div className={styles.busca}>
                    <input
                        type="text"
                        placeholder="Digite o nome da instituição: ex: Abrigo Por do Sol"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                         stroke="#7A7A7A" strokeWidth="2" strokeLinecap="round"
                         aria-hidden="true">
                        <circle cx="10" cy="10" r="6.5" />
                        <line x1="15" y1="15" x2="22" y2="22" />
                    </svg>
                </div>

                <section className={styles.lista}>
                    <p className={styles.sugestoes}>Sugestões:</p>

                    {erro && (
                        <p className={styles.aviso}>
                            Não foi possível carregar as instituições. O json-server está rodando?
                        </p>
                    )}

                    {!erro && filtradas.length === 0 && (
                        <p className={styles.aviso}>Nenhuma instituição encontrada.</p>
                    )}

                    {filtradas.map(item => (
                        <article key={item.id} className={styles.card}>
                            <div className={styles.info}>
                                {item.imagem
                                    ? <img src={item.imagem} alt={item.nome} className={styles.foto} />
                                    : <div className={styles.semFoto} />}
                                <div>
                                    <h3 className={styles.nome}>{item.nome}</h3>
                                    <p className={styles.descricao}>{item.descricao}</p>
                                </div>
                            </div>

                            <div className={styles.recursos}>
                                <span>Recursos em falta:</span>
                                <p>{item.recursos}</p>
                            </div>

                            <div className={styles.acao}>
                                <Link to={`/doar/${item.id}`} className={styles.doar}>
                                    Doar
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

            <Rodape />
        </div>
    );
}

export default Instituicoes;