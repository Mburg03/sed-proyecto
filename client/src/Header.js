import { Link } from "react-router-dom";

export default function Header(){
    return(
        <header>
        <Link to='/' className='logo'>MyBlog</Link>
        <nav>
          <Link to='/login'>Iniciar sesión</Link>
          <Link to='/register'>Registrarse</Link>
        </nav>
      </header>
    );
}