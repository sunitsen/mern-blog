// src/common/Cloudinary.jsx
import axios from 'axios';

export const uploadImage = async (img) => {

    let imgUrl = null;

    try {
        
        const { data } = await axios.get(import.meta.env.VITE_SERVER_URL + '/get-upload-url');

        const formData = new FormData();
        formData.append("file", img);
        formData.append("upload_preset", "mern-blog");
        formData.append("cloud_name", "dkeaeg11x");


        const response = await axios.post(data.url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        imgUrl = response.data.secure_url;
    } catch (err) {
         console.log(err);
    }

    return imgUrl;
};
