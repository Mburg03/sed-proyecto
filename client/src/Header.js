import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  useEffect(() => {
    // se usa :4000 ya que estamos agarrando información de la api, no enviando
    fetch('http://localhost:4000/profile', {
      credentials: 'include'
    }).then(response => {
      response.json().then(
        userInfo => {
          setUserInfo(userInfo);
        }); // tomando la información del usuario que ha iniciado sesión
    });
  }, []);


  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST'
    });

    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to='/' className='logo'>Blog SED</Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Crear un nuevo post</Link>
            <a onClick={logout}>Cerrar sesión ({username})</a>
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
