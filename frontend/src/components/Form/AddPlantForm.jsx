import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import { imageUpload } from "../../utils";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "../Shared/LoadingSpinner";
import ErrorPage from "../../pages/ErrorPage";
import { TbFidgetSpinner } from "react-icons/tb";

const AddPlantForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // tanstack query my use (post || Put || Patch || Delete)

  const {
    isPending,
    isError,
    mutateAsync,
    reset: mutationReset,
  } = useMutation({
    mutationFn: async (payload) =>
      await axios.post(`${import.meta.env.VITE_API_URL}/plants`, payload),
    onMutate: (payload) => {
      console.log(payload);
    },
    onSettled: (data, error) => {
      if (data) {
        toast.success("plant data created Successful");
        mutationReset();
        navigate("/dashboard/my-inventory");
      }
      if (error) toast.error("plant data created Flied!");
    },
    retry: 3,
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const handleSubmitFrom = async (data) => {
    const { name, category, description, price, quantity } = data;
    const imageFile = data?.image[0];
    try {
      const photoURL = await imageUpload(imageFile);
      const plantData = {
        name,
        category,
        description,
        price: Number(price),
        quantity: Number(quantity),
        photoURL,
        seler: {
          image: user.photoURL,
          name: user.displayName,
          email: user.email,
        },
      };
      await mutateAsync(plantData);
      reset();
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    }
  };

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorPage />;

  return (
    <div className="w-full min-h-[calc(100vh-40px)] flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50">
      <form onSubmit={handleSubmit(handleSubmitFrom)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-1 text-sm">
              <label htmlFor="name" className="block text-gray-600">
                Name
              </label>
              <input
                className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                id="name"
                {...register("name", {
                  required: "Name is required",
                  maxLength: {
                    value: 20,
                    message: "Name cannot be long",
                  },
                })}
                type="text"
                placeholder="Plant Name"
              />
              {errors.name && (
                <p className="text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
            {/* Category */}
            <div className="space-y-1 text-sm">
              <label htmlFor="category" className="block text-gray-600 ">
                Category
              </label>
              <select
                {...register("category", { required: "category is required" })}
                className="w-full px-4 py-3 border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                name="category"
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Succulent">Succulent</option>
                <option value="Flowering">Flowering</option>
              </select>
              {errors.category && (
                <p className="text-red-500 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>
            {/* Description */}
            <div className="space-y-1 text-sm">
              <label htmlFor="description" className="block text-gray-600">
                Description
              </label>

              <textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Write plant description here..."
                className="block rounded-md focus:lime-300 resize-none w-full h-32 px-4 py-3 text-gray-800  border border-lime-300 bg-white focus:outline-lime-500 "
                name="description"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-6 flex flex-col">
            {/* Price & Quantity */}
            <div className="flex justify-between gap-2">
              {/* Price */}
              <div className="space-y-1 text-sm">
                <label htmlFor="price" className="block text-gray-600 ">
                  Price
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                  name="price"
                  id="price"
                  {...register("price", {
                    required: "price is required",
                    min: {
                      value: 0,
                      message: "Price Must be Positive ",
                    },
                  })}
                  type="number"
                  placeholder="Price per unit"
                />
                {errors.price && (
                  <p className="text-red-500 font-medium">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1 text-sm">
                <label htmlFor="quantity" className="block text-gray-600">
                  Quantity
                </label>
                <input
                  className="w-full px-4 py-3 text-gray-800 border border-lime-300 focus:outline-lime-500 rounded-md bg-white"
                  name="quantity"
                  id="quantity"
                  {...register("quantity", {
                    required: "quantity is required",
                    min: {
                      value: 1,
                      message: "Quantity must be at last 1 ",
                    },
                  })}
                  type="number"
                  placeholder="Available quantity"
                />
                {errors.quantity && (
                  <p className="text-red-500 font-medium">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>
            {/* Image */}
            <div className=" p-4  w-full  m-auto rounded-lg grow">
              <div className="file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg">
                <div className="flex flex-col w-max mx-auto text-center">
                  <label>
                    <input
                      className="text-sm cursor-pointer w-36 hidden"
                      type="file"
                      name="image"
                      {...register("image", { required: "Image is required" })}
                      id="image"
                      accept="image/*"
                      hidden
                    />
                    {errors.image && (
                      <p className="text-red-500 font-medium">
                        {errors.image.message}
                      </p>
                    )}
                    <div className="bg-lime-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-lime-500">
                      Upload
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full cursor-pointer p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-lime-500 "
            >
              {isPending ? (
                <TbFidgetSpinner className="animate-spin m-auto" />
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPlantForm;
