import { useContext, useState, createContext } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: { personalInfo: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState('writing'); // Renamed 'editor' to 'writing' for clarity
    const [textEditor, setTextEditor] = useState({ isReady: false });

    const { userAuth: { access_token } } = useContext(UserContext);

    if (access_token === null) {
        return <Navigate to="/signin" />;
    }

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {editorState === 'writing' ? <BlogEditor /> : <PublishForm />}
        </EditorContext.Provider>
    );
};

export default Editor;
