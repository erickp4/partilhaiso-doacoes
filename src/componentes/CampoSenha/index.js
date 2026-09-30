import { useState } from 'react';
import styles from './CampoSenha.module.css';

function CampoSenha({ id, rotulo, placeholder, value, onChange }){
    const [visivel, setVisivel] = useState(false);

    return (
        <div className={styles.campo}>
            <label htmlFor={id}>{rotulo}</label>
            <div className={styles.senha}>
                <input
                    id={id}
                    name={id}
                    type={visivel ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required
                />
                <button
                    type="button"
                    className={styles.olho}
                    onClick={() => setVisivel(!visivel)}
                    aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8"
                         strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                        {visivel && <line x1="3" y1="3" x2="21" y2="21" />}
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default CampoSenha;