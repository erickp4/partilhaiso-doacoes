import styles from './CabecalhoLink.module.css';
import { Link } from 'react-router-dom';

function CabecalhoLink({url, children}){
    return(

    <Link to={url} className={styles.link}>
        {children}
    </Link>
    );
}

/*
Como chamar a função no react
vair fazer assim 
<CabecalioLink url="/">
    Home(botão)
</CabecalioLink> 
*/


export default CabecalhoLink;