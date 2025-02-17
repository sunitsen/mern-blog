import { useState, useRef, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../imgs/logo.png';
import AnimatedWrapper from '../common/page-animation';
import defaultBanner from '../imgs/blog banner.png';
import { EditorContext } from '../pages/editor.pages'; 
import EditorJS from '@editorjs/editorjs';
import { uploadImage } from '../common/Cloudinary';
import { tools } from './tools.component';
import { Toaster, toast } from "react-hot-toast";
import axios from 'axios';
import { UserContext } from '../App';

const BlogEditor = () => {
    const blogBannerRef = useRef(null);
    const [bannerUrl, setBannerUrl] = useState(defaultBanner);
    const { blog, setBlog, editorState, setEditorState, textEditor, setTextEditor } = useContext(EditorContext);
    const { userAuth: { access_token } } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: 'textEditor',
                data: blog.content,
                tools: tools,
                placeholder: 'Write your blog content here...',
            }));
        }
        if (blog.banner) {
            setBannerUrl(blog.banner);
        }
    }, [blog.content, textEditor, setTextEditor]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const loadingToast = toast.loading("Uploading image...");
            const url = await uploadImage(file);
            toast.dismiss(loadingToast);
            if (url) {
                setBannerUrl(url);
                toast.success("Uploaded");
                setBlog(prevBlog => ({ ...prevBlog, banner: url }));
            }
        } catch (err) {
            toast.error("Error uploading image:", err);
        }
    };

    const handleTitleChange = (e) => {
        const input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        setBlog(prevBlog => ({ ...prevBlog, title: input.value }));
    };

    const handlePublish = async () => {
        if (!blog.banner) return toast.error('Please upload a banner image');
        if (!blog.title) return toast.error('Please give a title');

        if (textEditor.isReady && textEditor.save) {
            try {
                const data = await textEditor.save();
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState('publish');
                } else {
                    toast.error('Please write some content');
                }
            } catch (err) {
                toast.error('Error saving content');
            }
        } else {
            toast.error("Editor is not ready");
        }
    };

    const handleSaveDraft = async (e) => {
        if (e.target.className.includes('disabled')) return;

        if (!blog.title.length) {
            return toast.error('Write blog title before saving it as a draft');
        }

        let loadingToast = toast.loading('Saving Draft...');
        e.target.classList.add('disabled');

        try {
            const content = await textEditor.save();
            const blogobj = { ...blog, content, draft: true };
            await axios.post(import.meta.env.VITE_SERVER_URL + '/create-blog', blogobj, {
                headers: { 'Authorization': `Bearer ${access_token}` },
            });
            e.target.classList.remove('disabled');
            toast.dismiss(loadingToast);
            toast.success('Saved');
            setTimeout(() => navigate("/"), 500);
        } catch (error) {
            e.target.classList.remove('disabled');
            toast.dismiss(loadingToast);
            toast.error(error?.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <>
            <Toaster />
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} alt="Logo" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {blog.title.length ? blog.title : "New Blog"}
                </p>
                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublish}>Publish</button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>

            <AnimatedWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-80 bg-white border-1 border-gray">
                            <label htmlFor="uploadBanner">
                                <img ref={blogBannerRef} src={bannerUrl} alt="Banner" className="z-20" />
                                <input type="file" accept=".png, .jpg, .jpeg" id="uploadBanner" hidden onChange={handleImageChange} />
                            </label>
                        </div>

                        <textarea
                            placeholder='Blog Title'
                            className='text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-30'
                            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                            onChange={handleTitleChange}
                            defaultValue={blog.title}
                        />

                        <hr className='w-full opacity-10 my-5' />
                        <div id='textEditor' className='font-gelasio'></div>
                    </div>
                </section>
            </AnimatedWrapper>
        </>
    );
};

export default BlogEditor;
