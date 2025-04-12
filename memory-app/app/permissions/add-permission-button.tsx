"use client";

import { useState } from "react";
import { createPermission } from "./actions";
import { useRouter } from "next/navigation";

interface AddPermissionButtonProps {
  permission: string;
  redirectUrl: string;
}

export default function AddPermissionButton({
  permission,
  redirectUrl,
}: AddPermissionButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  async function handleAddPermission() {
    if (!permission.trim()) return;

    try {
      setIsSubmitting(true);
      const permissionToken = await createPermission(permission.trim());
      // Redirect to the specified URL after creating permission
      router.push(`${redirectUrl}?permissionToken=${permissionToken.token}`);
    } catch (error) {
      console.error("Failed to create permission:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      onClick={handleAddPermission}
      className="mt-4 flex-1 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 flex justify-center items-center disabled:opacity-70"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Authorizing...
        </>
      ) : (
        "Authorize"
      )}
    </button>
  );
}
