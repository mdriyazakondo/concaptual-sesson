import axios from "axios";

export const imageUpload = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const { data } = await axios.post(
    `https://api.imgbb.com/1/upload?key=${
      import.meta.env.VITE_imageBB_secure_key
    }`,
    formData
  );

  return data?.data?.display_url;
};

//====== upload image cloudinary ========//

export const imageUploadCloudinary = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile); // <-- correct
  formData.append("upload_preset", import.meta.env.VITE_CLUDINARY_PRESET);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLUDINARY_NAME
    }/image/upload`,
    formData
  );

  return data?.secure_url;
};
