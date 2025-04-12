import getPermissions from "@/lib/get-permissions";
import AddPermissionModal from "./add-permission";

export default async function PermissionsPage() {
  const permissions = await getPermissions();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
        <AddPermissionModal />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-3 border border-gray-300 dark:border-gray-700">
              Token
            </th>
            <th className="text-left p-3 border border-gray-300 dark:border-gray-700">
              Prompt
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr
              key={permission.token}
              className="hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <td className="p-3 border border-gray-300 dark:border-gray-700">
                {permission.token}
              </td>
              <td className="p-3 border border-gray-300 dark:border-gray-700">
                {permission.prompt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
