import { useAuth } from "../../context/AuthContext";

export default function UserAddressCard() {
  const { user } = useAuth();

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              Account Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  User ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Indonesia
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Account Type
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Bogor
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Branch Assignment
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.branch_id !== null ? `Branch ${user?.branch_id}` : "No Branch Assigned"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  System
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Herbaflow WMS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
