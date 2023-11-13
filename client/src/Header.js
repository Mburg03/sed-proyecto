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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Link className='create-post' to="/create">Crear un nuevo post</Link>
            <button className='logout' onClick={logout}>Cerrar sesión ({username})</button>
          </>// este codigo corre en caso que el usuario si ha iniciado sesión, de lo contrario !username es ejecutado
        )}
        {!username && (
          <>
            <Link to='/login' className="login">Iniciar sesión</Link>
            <Link to='/register' className="register">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
}
