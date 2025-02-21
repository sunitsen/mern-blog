import { Quote as EditorJSQuote } from "@editorjs/quote";

const Img = ({ url, caption }) => {

    return (
        <div>
            <img src={url} alt={caption} />
            {caption.length ? (
                <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">
                    {caption}
                </p>
            ) : (
                ""
            )}
        </div>
    );
};

const CustomQuote = ({ quote, caption }) => {
    return (
        <div className="bg-purple/10 p-3 border-l-4 border-purple">
            <p className="text-xl leading-10 md:text-2xl">{quote}</p>
            {caption.length ? (
                <p className="w-full text-purple text-base leading-10 ">{caption}</p>
            ) : (
                ""
            )}
        </div>
    );
};

const List = ({ style, items }) => {
    return (
        <ol className={`pl-5 ${style === "ordered" ? " list-decimal " : "list-disc"}`}>
            {items.map((listItem, index) => {
                return (
                    <li key={index} className="my-4" dangerouslySetInnerHTML={{ __html: listItem }} />
                );
            })}
        </ol>
    );
};

const BlogContext = ({ block }) => {
    const { type, data } = block;


    if (type === "paragraph") {
        return <p dangerouslySetInnerHTML={{ __html: data.text }} />;
    }

    if (type === "header") {
        if (data.level === 3) {
            return <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }} />;
        }
        return <h2 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }} />;
    }

    if (type === "image") {
        return <Img url={data.file.url} caption={data.caption} />;
    }

    if (type === "quote") {
        return <CustomQuote quote={data.text} caption={data.caption} />;
    }

    if (type === "list") {
        return <List style={data.style} items={data.items} />;
    }

    return <h1>Unknown Block Type</h1>;
};

export default BlogContext;
