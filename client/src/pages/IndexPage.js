import { useContext, useEffect, useState } from "react"
import Post from "../Post"
import { UserContext } from "../UserContext";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        })
    }, []);

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

    var username = userInfo?.username;
    if (!username){
        username = 'usuario no registrado';
    }

    return (

        <div className="posts-index">
            <div className="welcome-text">            
                <p>Bienvenido <b>@{username}</b>, estos son los posts más recientes,</p>
            </div>
            <div>            
                {posts.length > 0 && posts.map(post => (
                    <Post {...post} />
                ))}
            </div>

        </div>


    )
}