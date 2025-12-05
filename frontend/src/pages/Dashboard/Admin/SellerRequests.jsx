import { useQuery } from "@tanstack/react-query";
import SellerRequestDataRow from "../../../components/Dashboard/TableRows/SellerRequestDataRow";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";

const SellerRequests = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const {
    data: sellers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["seller-request", user.email],
    queryFn: async () => {
      const res = await axiosSecure(`/seller-request`);
      return res.data;
    },
  });
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8">
      <h1>SEller{sellers?.length}</h1>
      <div className="py-8">
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  return (
                    <SellerRequestDataRow
                      key={seller._id}
                      seller={seller}
                      refetch={refetch}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRequests;
