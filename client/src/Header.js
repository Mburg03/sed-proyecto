import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo, isLoading, setIsLoading } = useContext(UserContext);
  const isAdmin = userInfo?.userType === "Admin";

  useEffect(() => {
    setIsLoading(true);
    fetch('http://192.168.86.171:4000/profile', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(userInfo => {
        setUserInfo(userInfo);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar los datos del usuario:", error);
        setIsLoading(false);
      });
  }, [setUserInfo, setIsLoading]);


  function logout() {
    fetch('http://192.168.86.171:4000/logout', {
      credentials: 'include',
      method: 'POST'
    }).then(() => {
      setUserInfo({}); // Restablecer userInfo
      // Redirigir al usuario a la página de inicio o de login usando React Router
      // history.push('/login'); // Asumiendo que tienes acceso a 'history' de React Router
    }).catch(error => {
      console.error("Error al cerrar sesión:", error);
    });
  }


  const username = userInfo?.username;

  if (isLoading) {
    return <div>Cargando...</div>; // Mostrar un mensaje de carga
  }

  return (
    <header>
      <Link to='/' className='logo'>Blog SED</Link>
      <nav>
        {username && !isAdmin && (
          <>
            <Link className='create-post' to="/create">Crear un nuevo post</Link>
            <button className='logout' onClick={logout}>Cerrar sesión ({username})</button>
          </>
        )}
        {!username && (
          <>
            <Link to='/login' className="login">Iniciar sesión</Link>
            <Link to='/register' className="register">Registrarse</Link>
          </>
        )}
        {username && isAdmin && (
          <>
            <button className='logout-admin' onClick={logout}>Cerrar sesión ({username})</button>
          </>
        )}
      </nav>
    </header>
  );
}
