// src/common/Cloudinary.jsx
import axios from 'axios';

export const uploadImage  = async (img) => {
    console.log(img)
    let imgUrl = null;
    try {
        // Step 1: Get Cloudinary upload parameters from the backend
        const { data } = await axios.get(import.meta.env.VITE_SERVER_URL + '/get-upload-url');

        // Step 2: Prepare form data
        const formData = new FormData();
        console.log(formData)


        formData.append("file", img);
        formData.append("upload_preset", "mern-blog");
        formData.append("cloud_name", "dkeaeg11x");

        console.log(formData)
        // Step 3: Upload image to Cloudinary
        const response = await axios.post(data.url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Step 4: Get the image URL from Cloudinary's response
        imgUrl = response.data.secure_url;
        console.log('✅ Image uploaded successfully');
    } catch (err) {
        console.error('❌ Image upload failed:', err.response?.data || err.message);
    }

    return imgUrl;
};
