import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";


export default function AdminHome({ userData }) {
    const [data, setData] = useState([]);
    const [postData, setPostData] = useState([]);

    useEffect(() => {
        getAllUser();
        getAllPost();
    }, []);

    const getAllUser = () => {
        fetch("http://192.168.86.171:4000/getAllUser", {
            method: "GET"
        }).then((res) => res.json()).then((data) => {
            setData(data.data);
        });
    };


    const getAllPost = () => {
        fetch("http://192.168.86.171:4000/getAllPosts", {
            method: "GET"
        }).then((res) => res.json()).then((data) => {

            if (Array.isArray(data)) {
                    setPostData(data);
                } else {
                    console.error("La respuesta del servidor no es la esperada.");

                }
            }).catch(error => {
                console.error("Error al obtener los posts");
            });

    };

    const deleteUser = (id, username) => {
        if (window.confirm(`Estás seguro de querer eliminar al usario ${username}`)) {
            fetch("http://192.168.86.171:4000/deleteUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    userid: id
                }),
            }).then((res) => res.json()).then((data) => {
                alert(data.data);
                getAllUser();
            });
        } else {

        }
    };

    const deletePost = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este post?")) {
            fetch("http://192.168.86.171:4000/deletePost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    postid: id
                }),
            }).then((res) => res.json()).then((data) => {
                alert(data.data);
                getAllPost();
            });
        } else {

        }
    };

    return (
        <div className="users-information">
            <h3>Información de usuarios registrados</h3>
            <table style={{ width: 600 }}>
                <tr>
                    <th>Username</th>
                    <th>Tipo de usuario</th>
                    <th>Id</th>
                    <th>Eliminar</th>
                </tr>
                {data.map(i => {
                    return (
                        <tr>
                            <td>{i.username}</td>
                            <td>{i.userType}</td>
                            <td>{i._id}</td>
                            <td><FontAwesomeIcon icon={faTrash}
                                onClick={() => deleteUser(i._id, i.username)}
                            /></td>
                        </tr>
                    )
                })}
            </table>
            <div className="posts-information">
                <h3>Información de posts registrados</h3>
                <table style={{ width: 1000 }}>
                    <tr>
                        <th>Id</th>
                        <th>Autor</th>
                        <th>Creación</th>
                        <th>Titulo</th>
                        <th>Eliminar</th>
                    </tr>
                    {postData.map(i => {
                        return (
                            <tr>
                                <td>{i._id}</td>
                                <td>{i.authorName}</td>
                                <td>{i.createdAt}</td>
                                <td>{i.title}</td>
                                <td><FontAwesomeIcon icon={faTrash} onClick={() => deletePost(i._id)}
                                /></td>
                            </tr>
                        )
                    })}
                </table>

            </div>
        </div>
    );
}
