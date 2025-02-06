// Importing Editor.js tools
import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Quote from "@editorjs/quote"; // Fixed: Capitalized 'Quote'

import { uploadImage } from "../common/Cloudinary ";// Ensure this function is correctly imported

// Function to handle image upload by file
const uploadImageByFile = async (e) => {
    try {
        const url = await uploadImage(e); // Assuming uploadImage returns the URL
        if (url) {
            return {
                success: 1,
                file: { url }
            };
        }
    } catch (error) {
        console.error("Error uploading image by file:", error);
        return {
            success: 0,
            message: 'Failed to upload image'
        };
    }
};

// Function to handle image upload by URL
const uploadImageByUrl = async (url) => {
    try {
        // You can add more validation here if needed
        return {
            success: 1,
            file: { url }
        };
    } catch (error) {
        console.error("Error uploading image by URL:", error);
        return {
            success: 0,
            message: 'Failed to upload image by URL'
        };
    }
};

// Exporting tools for Editor.js
export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByUrl, // Corrected function name for URL uploads
                uploadByFile: uploadImageByFile // Updated for file uploads
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
            levels: [2, 3],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode
};
