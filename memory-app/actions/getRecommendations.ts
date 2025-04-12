import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";



export async function getRecommendations(permissionToken: string) {

	const response = await fetch(`http://localhost:3000/api/prompt?${new URLSearchParams({ question: "what is the users favorite foods" }).toString()}`, {
		headers: {
			'Authorization': `Bearer ${permissionToken}`
		}
	});

	if (!response.ok) {
		return { success: false, error: "Failed to fetch favorite foods" }
	}

	const favouriteFoods = await response.text();

	console.log({ favouriteFoods });
	const restaurants = await generateObject({
		model: openai("gpt-4o-mini"),
		schema: z.object({
			restaurants: z.array(z.string().describe("the name of the restaurant"))
		}),
		prompt: `
		given users favorite foods:
		${favouriteFoods}
		return top 5 restaurants in the area for his likes given the following mocked restaurants:
		${JSON.stringify(mockedRestaurants)}
		`
	})
	console.log({ restaurants });

	const restaurantNames = restaurants.object.restaurants;

	return { data: restaurantNames, success: true };
}

export const mockedRestaurants = [
	{ id: 1, name: "Sapore Italiano", cuisine: "Italian", rating: 4.7, price: "$$", location: "Downtown" },
	{ id: 2, name: "Tokyo Sushi", cuisine: "Japanese", rating: 4.5, price: "$$$", location: "Uptown" },
	{ id: 3, name: "The Spice Route", cuisine: "Indian", rating: 4.8, price: "$$", location: "West End" },
	{ id: 4, name: "El Mariachi", cuisine: "Mexican", rating: 4.3, price: "$", location: "South Side" },
	{ id: 5, name: "Golden Dragon", cuisine: "Chinese", rating: 4.2, price: "$$", location: "Chinatown" },
	{ id: 6, name: "Le Petit Bistro", cuisine: "French", rating: 4.9, price: "$$$", location: "Downtown" },
	{ id: 7, name: "Athens Taverna", cuisine: "Greek", rating: 4.4, price: "$$", location: "East Side" },
	{ id: 8, name: "Bangkok Street Food", cuisine: "Thai", rating: 4.6, price: "$", location: "Market District" },
	{ id: 9, name: "Seoul Kitchen", cuisine: "Korean", rating: 4.5, price: "$$", location: "University Area" },
	{ id: 10, name: "Bombay Palace", cuisine: "Indian", rating: 4.3, price: "$$", location: "North End" },
	{ id: 11, name: "Burger Joint", cuisine: "American", rating: 4.2, price: "$", location: "Downtown" },
	{ id: 12, name: "Mediterranean Delights", cuisine: "Mediterranean", rating: 4.7, price: "$$", location: "Harbor View" },
	{ id: 13, name: "Pho Delicious", cuisine: "Vietnamese", rating: 4.6, price: "$", location: "West Side" },
	{ id: 14, name: "Tuscany Garden", cuisine: "Italian", rating: 4.4, price: "$$$", location: "Uptown" },
	{ id: 15, name: "Taco Fiesta", cuisine: "Mexican", rating: 4.1, price: "$", location: "South Market" },
	{ id: 16, name: "Sizzling Steakhouse", cuisine: "Steakhouse", rating: 4.8, price: "$$$", location: "Financial District" },
	{ id: 17, name: "Ocean Catch", cuisine: "Seafood", rating: 4.7, price: "$$$", location: "Waterfront" },
	{ id: 18, name: "Falafel House", cuisine: "Middle Eastern", rating: 4.3, price: "$", location: "University Area" },
	{ id: 19, name: "Curry Corner", cuisine: "Indian", rating: 4.4, price: "$$", location: "East End" },
	{ id: 20, name: "BBQ Smokehouse", cuisine: "Barbecue", rating: 4.6, price: "$$", location: "West Side" },
	{ id: 21, name: "Dim Sum Palace", cuisine: "Chinese", rating: 4.5, price: "$$", location: "Chinatown" },
	{ id: 22, name: "Crepe Cafe", cuisine: "French", rating: 4.3, price: "$$", location: "Arts District" },
	{ id: 23, name: "Noodle House", cuisine: "Japanese", rating: 4.2, price: "$", location: "Downtown" },
	{ id: 24, name: "Veggie Delight", cuisine: "Vegetarian", rating: 4.4, price: "$$", location: "Green Valley" },
	{ id: 25, name: "Tapas Bar", cuisine: "Spanish", rating: 4.6, price: "$$", location: "Downtown" },
	{ id: 26, name: "Tandoori Nights", cuisine: "Indian", rating: 4.5, price: "$$", location: "North Side" },
	{ id: 27, name: "Bavarian Beer Hall", cuisine: "German", rating: 4.3, price: "$$", location: "Old Town" },
	{ id: 28, name: "Sake House", cuisine: "Japanese", rating: 4.7, price: "$$$", location: "East Side" },
	{ id: 29, name: "Pasta Paradise", cuisine: "Italian", rating: 4.4, price: "$$", location: "Little Italy" },
	{ id: 30, name: "Texas Grill", cuisine: "American", rating: 4.2, price: "$$", location: "South End" },
	{ id: 31, name: "Lebanese Garden", cuisine: "Lebanese", rating: 4.5, price: "$$", location: "West End" },
	{ id: 32, name: "Vegan Corner", cuisine: "Vegan", rating: 4.3, price: "$$", location: "University District" },
	{ id: 33, name: "Brazilian Steakhouse", cuisine: "Brazilian", rating: 4.8, price: "$$$", location: "Downtown" },
	{ id: 34, name: "Russian Tea Room", cuisine: "Russian", rating: 4.2, price: "$$", location: "North End" },
	{ id: 35, name: "Peruvian Grill", cuisine: "Peruvian", rating: 4.4, price: "$$", location: "Market District" },
	{ id: 36, name: "Fish & Chips", cuisine: "British", rating: 4.1, price: "$", location: "Harbor Area" },
	{ id: 37, name: "Caribbean Flavors", cuisine: "Caribbean", rating: 4.5, price: "$$", location: "South Side" },
	{ id: 38, name: "Ethiopian Experience", cuisine: "Ethiopian", rating: 4.6, price: "$$", location: "International District" },
	{ id: 39, name: "Ramen Shop", cuisine: "Japanese", rating: 4.7, price: "$", location: "Downtown" },
	{ id: 40, name: "Polish Deli", cuisine: "Polish", rating: 4.3, price: "$", location: "Old Town" },
	{ id: 41, name: "Fusion Bistro", cuisine: "Fusion", rating: 4.6, price: "$$$", location: "Arts District" },
	{ id: 42, name: "Cuban Cafe", cuisine: "Cuban", rating: 4.4, price: "$$", location: "East End" },
	{ id: 43, name: "Turkish Delight", cuisine: "Turkish", rating: 4.5, price: "$$", location: "West Side" },
	{ id: 44, name: "Southern Comfort", cuisine: "Southern", rating: 4.7, price: "$$", location: "Downtown" },
	{ id: 45, name: "Malaysian Spice", cuisine: "Malaysian", rating: 4.4, price: "$$", location: "International District" },
	{ id: 46, name: "Indonesian Kitchen", cuisine: "Indonesian", rating: 4.3, price: "$$", location: "South Market" },
	{ id: 47, name: "Moroccan Oasis", cuisine: "Moroccan", rating: 4.5, price: "$$", location: "North End" },
	{ id: 48, name: "Filipino Flavors", cuisine: "Filipino", rating: 4.2, price: "$", location: "West End" },
	{ id: 49, name: "Swiss Chalet", cuisine: "Swiss", rating: 4.6, price: "$$$", location: "Downtown" },
	{ id: 50, name: "Argentine Grill", cuisine: "Argentinian", rating: 4.7, price: "$$$", location: "East Side" }
];