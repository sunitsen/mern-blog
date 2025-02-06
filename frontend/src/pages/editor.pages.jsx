import { useContext, useState, createContext } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
2.47
const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: { personalInfo: {} },
};

export const EditorContext   = createContext({});

const Editor = () => {
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState('editor');
    const [textEditor, setTextEditor] = useState({ isReady: false });

    let { userAuth: { access_token } } = useContext(UserContext);

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
        {editorState === "editor" ? <BlogEditor /> : <PublishForm />}
    </EditorContext.Provider>
    );
};

export default Editor;
