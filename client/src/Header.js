import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Header(){
  const [username, setUsername] = useState(null);
  useEffect(() => {
    // se usa :4000 ya que estamos agarrando información de la api, no enviando
    fetch('http://localhost:4000/profile', {
      credentials: 'include'
    }).then(response => {
      response.json().then(
        userInfo => {
            setUsername(userInfo.username);
        }); // tomando la informacion del usuario que ha iniciado sesion
    });
  }, []);

    return(
        <header>
        <Link to='/' className='logo'>MyBlog</Link>
        <nav>
          {username && (
            <>
              <Link to="/create">Crear un nuevo post</Link>
              <a>Cerrar sesión</a>
            </>// este codigo corre en caso que el usuario si ha iniciado sesión, de lo contrario !username es ejecutado
          )} 
          {!username && (
            <>
              <Link to='/login'>Iniciar sesión</Link>
              <Link to='/register'>Registrarse</Link>
            </>
          )}

        </nav>
      </header>
    );
}
