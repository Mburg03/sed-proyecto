import { Link } from 'react-router-dom';
import Federico from "./config";


export default function Post({ _id, title, summary, cover, content, createdAt, author }) {
    const federico = Federico.SECRET_API;
    return (
        <div className='post'>
            <div className='image'>
                <Link to={`/post/${_id}`}>
                    <img src={`http://${federico}:4000/` + cover} alt='reference'></img>
                </Link>-*
            </div>
            <div className='texts'>
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    <a className="author">{author}</a>
                    <time>{createdAt}</time>
                </p>
                <p className='summary'>{summary}</p>
            </div>
        </div>

    );
}

