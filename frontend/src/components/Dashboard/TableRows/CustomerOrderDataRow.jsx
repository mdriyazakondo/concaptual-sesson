import { useState } from "react";
import DeleteModal from "../../Modal/DeleteModal";
const CustomerOrderDataRow = ({ order }) => {
  let [isOpen, setIsOpen] = useState(false);
  const closeModal = () => setIsOpen(false);

  const { name, image, category, quantity, price, status } = order;

  // {
  //     _id: '692f3384eb1c07fc29810df6',
  //     plantId: '692ccdf76dda229a302f00a7',
  //     transationId: 'pi_3SZyWV2OTEi9mGRa0IoBdtfw',
  //     customer: 'mdriyazakonda@gmail.com',
  //     status: 'pending',
  //     seler: {
  //       image:
  //         'https://i.ibb.co/zH24tY33/492201196-651274174453974-6884588557934738098-n.jpg',
  //       name: 'riyaz',
  //       email: 'sima@gmail.com'
  // name: 'Quinn Garcia',
  //   category: 'Outdoor',
  //   quantity: 1,
  //   image: 'https://i.ibb.co/4RrtGC97/istockphoto-584465628-612x612.jpg',
  //   price: null
  //     },

  return (
    <tr>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="block relative">
              <img
                alt="profile"
                src={image}
                className="mx-auto object-cover rounded h-10 w-15 "
              />
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900">{name}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900">{category}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900">${price}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900">{quantity}</p>
      </td>
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <p className="text-gray-900">{status}</p>
      </td>

      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <button
          onClick={() => setIsOpen(true)}
          className="relative disabled:cursor-not-allowed cursor-pointer inline-block px-3 py-1 font-semibold text-lime-900 leading-tight"
        >
          <span className="absolute cursor-pointer inset-0 bg-red-200 opacity-50 rounded-full"></span>
          <span className="relative cursor-pointer">Cancel</span>
        </button>

        <DeleteModal isOpen={isOpen} closeModal={closeModal} />
      </td>
    </tr>
  );
};

export default CustomerOrderDataRow;
