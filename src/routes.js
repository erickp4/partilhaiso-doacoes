import Inicio from "./paginas/inicial";
import Sobre from "./paginas/Sobre";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
        </Routes>
        </BrowserRouter>
    );
}

//Faz com que de pra usar a função em outros lugares
export default AppRoutes;
