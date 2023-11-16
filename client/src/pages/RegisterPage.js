import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState("User");
    const [secretKey, setSecretKey] = useState("");

    async function register(ev) {
        ev.preventDefault();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!username || username.length < 3 || username.length > 10) {
            alert("Nombre de usuario inválido. Debe tener entre 3 y 10 caracteres.");
            return;
        }

        if (!passwordRegex.test(password)) {
            alert("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.");
            return;
        }

        if (userType === "Admin" && secretKey !== "M@rito#2003") {
            alert("Clave de administrador inválida.");
            return;
        } else {
            try {
                const response = await fetch('http://localhost:4000/register', {
                    method: 'POST',
                    body: JSON.stringify({ username, password, userType, secretKey }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const responseData = await response.json(); // Obtener la respuesta en formato JSON

                if (response.ok) {
                    alert('Registrado exitosamente');
                } else if (response.status === 403){
                    alert('Contraseña clave equivocada.')
                }
                else if (response.status === 429) {
                    alert('Baneadisimo mi loco.')
                }else {
                        alert(`Error en el registro`);
                    }
            } catch (error) {
                console.error('Error al hacer la solicitud');
                alert('Hubo un problema con la solicitud de registro.');
            }
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