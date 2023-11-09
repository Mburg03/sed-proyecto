import { useState } from "react";

export default function RegisterPage(){
    const [username, setUsername] = useState('');
    const[password, setPassword] = useState('');

    async function register(ev){ // ev se refiere al evento que sucede cuando hay un OnSubmit en <form>
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/register', { 
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type': 'application/json'}
        })
        if (response.status !== 200){
            alert('Tu registro no pudo ser posible.') // el error será diferente a 200 cuando ya haya un usuario registradio con los mismos campos
        } else {
            alert('Registrado exitosamente')
        }
    }
    return(
        <form className="register" onSubmit={register}>
            <h1>Registrarse</h1>
            <input type="text" placeholder="Usuario" value={username} onChange={ev => setUsername(ev.target.value)}/>

            <input type="password" placeholder="Contraseña" value={password} onChange={ev => setPassword(ev.target.value)}/>
        <button>Registrar</button>
    </form>
    );
}