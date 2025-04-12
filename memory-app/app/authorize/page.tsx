import AddPermissionButton from "../permissions/add-permission-button";

export default async function Authorize({
  searchParams,
}: {
  searchParams: { permission: string; redirectUrl: string };
}) {
  const sp = await searchParams;

  const permission = sp.permission;
  const redirectUrl = sp.redirectUrl;
  const appName = "Memory App"; // You can customize this
  const userHandle = "user"; // This could be dynamic in a real app

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header with logos and app name */}
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-6 mb-4">
            {/* App logo */}
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">M</span>
            </div>

            {/* Success checkmark */}
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* GitHub-like logo */}
            <div className="w-12 h-12 bg-gray-900 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M8 16l2.5-3.5L13 16l5-7.5L20 14H4z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Authorize {appName}</h1>
        </div>

        {/* App info and permissions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              <span className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
                M
              </span>
            </div>
            <div>
              <h2 className="font-semibold">
                {appName} by <span className="text-blue-500">{userHandle}</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                wants to access your {userHandle} account
              </p>
            </div>
          </div>

          {/* Permissions section */}
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Permission Request</h3>
                  <button className="text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This app is requesting permission to:
                </p>
                <p className="text-sm font-medium mt-1 text-gray-800 dark:text-gray-200 p-8 w-f">
                  <strong>{permission}</strong>
                </p>
              </div>
            </div>
          </div>
          <AddPermissionButton
            permission={permission}
            redirectUrl={redirectUrl}
          />
        </div>
      </div>
    </div>
  );
}
