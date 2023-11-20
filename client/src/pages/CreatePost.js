import { useState } from "react";
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css';
import { Navigate } from "react-router-dom";
import Federico from "../config"

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        ['clean']
    ],
};
const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
];



export default function CreatePost() {
    const [title, SetTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFile] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        const data = new FormData();
        const federico = Federico.SECRET_API;
        data.set("title", title);
        data.set("summary", summary);
        data.set("content", content);
        data.set("file", files[0]);
        ev.preventDefault();

        // Validaciones básicas
        if (!title || title.length < 3) {
            alert("Por favor, proporciona un título válido (mínimo 3 caracteres).");
            return;
        }

        if (!summary || summary.length < 10) {
            alert("Por favor, proporciona un resumen válido (mínimo 10 caracteres).");
            return;
        }

        if (!content || content.length < 20) {
            alert("Por favor, proporciona contenido válido (mínimo 20 caracteres).");
            return;
        }

        if (!files || files.length === 0) {
            alert("Por favor, selecciona un archivo para subir.");
            return;
        } else {
            const response = await fetch(`http://${federico}:4000/post`, {
                method: 'POST',
                body: data,
                credentials: 'include'
            });
            if (response.status !== 200) {
                alert('Tu post no pudo ser publicado, intentá revisar los campos que llenaste.');
            } else {
                alert('Tu post ha sido creado.');
                setRedirect(true);
            }
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    };

    return (
        <form onSubmit={createNewPost}>
            <input type='title' placeholder={'Titulo'} value={title} onChange={ev => {
                SetTitle(ev.target.value)
            }} />

            <input type='summary' placeholder={'Resumen'} value={summary} onChange={ev => {
                setSummary(ev.target.value)
            }} />
            <input type='file' onChange={ev =>
                setFile(ev.target.files)} />

            <ReactQuill value={content} modules={modules} formats={formats} onChange={newValue =>
                setContent(newValue)} />

            <button style={{ marginTop: '10px' }}>Crear Post</button>

        </form>

    );
}
