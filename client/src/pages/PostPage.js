import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from 'dompurify';
import { formatISO9075 } from "date-fns";


export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { id } = useParams();
    useEffect(() => {
        fetch(`http://192.168.86.171:4000/post/${id}`).then(response => {
            response.json().then(postInfo => {
                setPostInfo(postInfo);
            });
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (!postInfo) return '';
    const post_content = DOMPurify.sanitize(postInfo.content)
    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <div className="author">Escrito por: @{postInfo.authorInfo.username}</div>
            <div className="image">
                <img src={`http://192.168.86.171:4000/${postInfo.cover}`} alt="user"/>
            </div>
            <div className="content" dangerouslySetInnerHTML={{__html:post_content}}/>
            
        </div>
    );
}
