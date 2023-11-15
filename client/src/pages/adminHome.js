import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";


export default function AdminHome({ userData }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        getAllUser();
    }, []);

    const getAllUser = () => {
        fetch("http://localhost:4000/getAllUser", {
            method: "GET"
        }).then((res) => res.json()).then((data) => {
            console.log(data, "userData")
            setData(data.data);
        });
    };

    const deleteUser = (id, username) => {
        if (window.confirm(`Estás seguro de querer eliminar al usario ${username}`)) {
            fetch("http://localhost:4000/deleteUser", {
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
        </div>

    );
}