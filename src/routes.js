import Inicio from "./paginas/inicial";
import Sobre from "./paginas/Sobre";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./paginas/Login";
import CadastroInstitucional from "./paginas/CadastroInstitucional";
import CadastroPessoal from "./paginas/CadastroPessoal";
import Instituicoes from "./paginas/Instituicoes";
import Feed from "./paginas/Feed";
import Perfil from "./paginas/Perfil";
import EditarPerfil from "./paginas/EditarPerfil";
import FazerPedidos from "./paginas/FazerPedidos";
import Chat from "./paginas/Chat";

function AppRoutes(){
    return (
        //<BrowserRouter> navega pelos links das paginas
        //Routes guarda as rotas possiveis 
        /*Route é a regra das rotas 
        ta falando quando o caminho(path) for (/) vai pra pagina principal 
        elemento(element) fala que quando element={<Inicio/>}
        mostre o componente Inicio na tela
        
        */ 
        <BrowserRouter>
        <Routes>
        <Route path = "/"  element = {<Inicio />}></Route>
        <Route path = "/sobre"  element = {<Sobre />}></Route>
        <Route path = "/login"  element = {<Login />}></Route>
        <Route path = "/cadastro-institucional"  element = {<CadastroInstitucional />}></Route>
        <Route path = "/cadastro-pessoal"  element = {<CadastroPessoal />}></Route>
        <Route path = "/instituicoes"  element = {<Instituicoes />}></Route>
        <Route path = "/feed"  element = {<Feed />}></Route>
        <Route path="/instituicao/:id" element={<Perfil />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        <Route path="/fazer-pedidos" element={<FazerPedidos />} />
        <Route path="/chat" element={<Chat />} />
        </Routes>
        </BrowserRouter>
    );
}

//Faz com que de pra usar a função em outros lugares
export default AppRoutes;
