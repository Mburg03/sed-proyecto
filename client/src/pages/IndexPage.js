import { useContext, useEffect, useState } from "react"
import Post from "../Post"
import { UserContext } from "../UserContext";
import AdminHome from "./adminHome";
import Federico from "../config"

export default function IndexPage() {
    const federico = Federico.SECRET_API;
    const [posts, setPosts] = useState([]);
    const { userInfo } = useContext(UserContext);
    const isAdmin = userInfo?.userType === "Admin";
    const username = userInfo?.username;

    useEffect(() => {
        fetch(`http://${federico}:4000/post`).then(response => {
            response.json().then(posts => {
                if (Array.isArray(posts)) {
                    setPosts(posts);
                } else {
                    console.error("La respuesta del servidor no es la esperada.");

                }
            }).catch(error => {
                console.error("Error al obtener los posts");
            });
        });
    }, []);
    // Renderizado condicional basado en la información del usuario
    let content;
    if (username) {
        if (isAdmin) {
            content = (
                <div className="admin-display">
                    <p className="welcome-admin-text">Bienvenido administrador, <b>@{username}</b></p>
                    <hr></hr>
                    <AdminHome />
                    <h3>Posts autorizados</h3>
                    <div className="admin-posts-display">
                        {posts.length > 0 && posts.map(post => (
                            <Post key={post.id} {...post} author={post.authorName} />
                        ))}
                    </div>


                </div>
            );


        } else {
            content = (
                <>
                    <div className="welcome-text">
                        <p>Bienvenido <b>@{username}</b>, estos son los posts más recientes,</p>
                    </div>
                    <div>
                        {posts.length > 0 && posts.map(post => (
                            <Post key={post.id} {...post} author={post.authorName} />
                        ))}
                    </div>
                </>
            );
        }
    } else {
        content = (
            <div className="not-logged">
                <h1>Bienvenido al Blog de SED</h1>
                <p>¡Registrate o inicia sesión para poder acceder a los beneficios de nuestra plataforma! </p>
                <p><b>Integrantes del grupo</b></p>
                <ul>
                    <li>Mario Francisco Umaña Burgos - 00063121</li>
                    <li>Rodrigo Andrés Mena Caballero - 00078421</li>
                    <li>Francisco Alonso Torres Rosa - 00046821</li>
                </ul>
            </div>

        );
    }

    return <div className="posts-index">{content}</div>;
}
