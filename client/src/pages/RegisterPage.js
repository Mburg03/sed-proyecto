import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState("User");
    const [secretKey, setSecretKey] = useState("");
    const handleSubmit = (e) => {
        if (userType === "Admin" && secretKey != "M@rito#2003") {
            e.preventDefault();
            alert("Invalid Admin");
        } else {
            e.preventDefault();
        }
    }
    async function register(ev) { // ev se refiere al evento que sucede cuando hay un OnSubmit en <form>
        if (userType === "Admin" && secretKey !== "M@rito#2003") {
            ev.preventDefault();
            alert("Invalid Admin");
        } 
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, userType }),
            headers: { 'Content-Type': 'application/json' }
        })
        if (response.status !== 200) {
            alert('Tu registro no pudo ser posible.') // el error será diferente a 200 cuando ya haya un usuario registradio con los mismos campos
        } else {
            alert('Registrado exitosamente')
        }
    }
    return (
        <form className="register" onSubmit={register}>
            <h1>Registrarse</h1>
            <div class="signup-options">
                <label for="register-as" className="register-as-label">Registrarse como</label>
                <div class="radio-buttons">
                    <input type="radio" name="UserType" value="User" onChange={(e) => setUserType(e.target.value)} />
                    <label for="user">Usuario</label>
                    <input type="radio" name="UserType" value="Admin" onChange={(e) => setUserType(e.target.value)} />
                    <label for="admin">Administrador</label>
                </div>
            </div>

            {userType === "Admin" ? (
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Secret Key"
                        onChange={(e) => setSecretKey(e.target.value)}
                    />
                </div>
            ) : null}

            <input type="text" placeholder="Usuario" value={username} onChange={ev => setUsername(ev.target.value)} />

            <input type="password" placeholder="Contraseña" value={password} onChange={ev => setPassword(ev.target.value)} />
            <button>Registrar</button>
        </form>
    );
}