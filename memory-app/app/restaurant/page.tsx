import {
  getRecommendations,
  mockedRestaurants,
} from "@/actions/getRecommendations";

export default async function Home() {
  const restaurants = await getRecommendations();

  return (
    <main className="container mx-auto py-10 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recommended Restaurants</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Based on your favorite foods
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockedRestaurants
          .filter((restaurant) => restaurants.includes(restaurant.name))
          .map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {restaurant.name}
                </h2>
                <div className="flex items-center mb-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full">
                    {restaurant.cuisine}
                  </span>
                </div>
                <div className="flex items-center text-sm mb-3">
                  <div className="flex items-center mr-4">
                    <span className="mr-1">⭐</span>
                    <span>{restaurant.rating}</span>
                  </div>
                  <div className="mr-4">
                    <span>{restaurant.price}</span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    <span>{restaurant.location}</span>
                  </div>
                </div>
                <button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300 w-full">
                  View Details
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
