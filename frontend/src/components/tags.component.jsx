import { EditorContext } from "../pages/editor.pages";
import { useContext } from "react";

const Tag = ({ tag, tagIndex }) => {
  let { blog, blog: { tags }, setBlog } = useContext(EditorContext);

  // 🗑️ Delete Tag Function
  const handleTagDelete = () => {
    const updatedTags = tags.filter(t => t !== tag);
    setBlog({ ...blog, tags: updatedTags });
  };

  // ✏️ Make Tag Editable
  const addEditable = (e) => {
    e.target.setAttribute("contenteditable", true);
    e.target.focus();
  };

  // ✏️ Edit Tag on Enter
  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      
      let currentTag = e.target.innerText;
      
      tags[tagIndex] = currentTag;

      setBlog({ ...blog, tags });

      // Remove contentEditable
      e.target.setAttribute("contenteditable", false);
    
    }
  };

  return (
    <div className="relative mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-8">
      {/* Editable Tag */}
      <p
        className="outline-none"
        onClick={addEditable}
        onKeyDown={handleTagEdit}
         // Remove editable on blur
      >
        {tag}
      </p>

      {/* Delete Button */}
      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>

    
    </div>
  );
};

export default Tag;
