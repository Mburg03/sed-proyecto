import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false); // redireccionar a Home
    const { setUserInfo } = useContext(UserContext);

    async function login(ev) {
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        }); // creando envio a la api de login de usuario

        if (response.ok) {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                setRedirect(true); // cambiar redireccionar hacia Home si el inicio de sesión es response(200)
            });
        } else {
            alert('Contraseña y/o usuario incorrecto.')
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />  // navegando hacia Home
    }
    return (
        <form className="login" onSubmit={login}>
            <h1>Iniciar sesión</h1>

            <input type="text" placeholder="Usuario" value={username} onChange={ev => setUsername(ev.target.value)} />

            <input type="password" placeholder="Contraseña" value={password} onChange={ev => setPassword(ev.target.value)} />

            <button>Iniciar sesión</button>
        </form>
    );
}