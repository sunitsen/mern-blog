// src/common/Cloudinary.jsx
import axios from 'axios';

export const uploadImage = async (img) => {

    let imgUrl = null;

    try {
        // Step 1: Get Cloudinary upload parameters from the backend
        const { data } = await axios.get(import.meta.env.VITE_SERVER_URL + '/get-upload-url');

        // Step 2: Prepare form data
        const formData = new FormData();
        formData.append("file", img);
        formData.append("upload_preset", "mern-blog");
        formData.append("cloud_name", "dkeaeg11x");


        // Step 3: Upload image to Cloudinary
        const response = await axios.post(data.url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Step 4: Get the image URL from Cloudinary's response
        imgUrl = response.data.secure_url;
    } catch (err) {
         console.log(err);
    }

    return imgUrl;
};
