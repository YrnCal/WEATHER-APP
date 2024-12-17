import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { Search, ThreeDots } from "~/icon";

export const meta: MetaFunction = () => {
  return [
    { title: "weather app" },
    { name: "description", content: "Get current weather information" },
  ];
};

interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust: number };
  clouds: { all: number };
  dt: 1733904737;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}
export async function loader({ request }: LoaderFunctionArgs) {
  let url = new URL(request.url);
  // console.log({url});

  let searchParams = url.searchParams;

  let city = searchParams.get("q") || "Nanyuki";

  let weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
  );
  let weather: WeatherResponse = await weatherRes.json();

  if (!city) {
    throw new Response("City name not found", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  return weather;
}

export default function index() {
  let weather = useLoaderData<typeof loader>();
  console.log({ weather });

  let navigation = useNavigation();
  console.log({ navigation });

  let [searchParams] = useSearchParams();
  let q = searchParams.get("q");

  let isSearching =
    navigation.state === "loading" && navigation.location.search;

  let locations = ["Nairobi", "Tokyo", "Cairo", "Helsinki"];
  return (
    <main
      className={`h-screen w-full bg-cover bg-[url('https://images.unsplash.com/photo-1561484930-974554019ade?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJlYXV0aWZ1bCUyMHdlYXRoZXIlMjBpbWFnZXN8ZW58MHx8MHx8fDA%3D')] bg-no-repeat bg-center grid lg:grid-cols-5 gap-4`}
    >
      {/* pending ui */}
      {isSearching ? (
        <div className="w-full h-screen absolute inset-0 grid place-items-center bg-black/50">
          <span w-20>
            <ThreeDots />
          </span>
        </div>
      ) : null}
      <div className="lg:col-span-3 flex flex-col justify-between p-8 lg:pb-24">
        {/* weather */}
        <h1 className="text-2xl font-bold mb-6 text-white">Weather App</h1>
        <div className="flex gap-4 items-center mt-8">
          <span className="text-4xl lg:text-6xl font-semibold text-white">
            {weather.main.temp}&#8451;
          </span>
          <span className="text-2xl text-white">{weather.name}</span>
          <span className="text-white">{weather.weather[0].main}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="weather-icon"
            className="w-16"
          />
        </div>
      </div>

      <div className="backdrop-blur-md lg:col-span-1 px-4 lg:px-5 items-end">
        {/* form & details */}
        <Form>
          <input
            type="search"
            name="q"
            placeholder="Search location"
            aria-label="Search location"
            className="border-gray-300 bg-transparent border px-4 py-2 placeholder:text-gray-300"
          />
          <button type="submit" className="bg-orange-500 p-2 text-white">
            <Search />
          </button>
        </Form>
        <ul className="space-y-2 text-gray-300 mt-8">
          {locations.map((city) => (
            <li key={city}>
              <Link to={`?q=${city}`}>{city}</Link>
            </li>
          ))}
        </ul>
        <div>
          <h2>Weather Details</h2>
          <ul className="mt-4 text-gray-300">
            {weather.weather.map((item) => (
              <li key={item.id}>{item.main}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-12 h-12 text-red-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3m0 4h.01m-6.938 4h13.856c1.152 0 2.074-.926 1.995-2.074L20.125 6.47C20.043 5.316 19.12 4.395 17.966 4.395H6.034C4.88 4.395 3.957 5.316 3.875 6.47L2.08 18.926c-.08 1.148.844 2.074 1.996 2.074z"
      />
    </svg>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="w-full h-screen flex flex-col items-center gap-4">
        <div>
          <ErrorIcon />
        </div>
        <h1 className="text-3xl text-red-500">
          {error.status} {error.statusText}
        </h1>
        <p className="text-red-400">{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="w-full h-screen gird place-items-center">
        <div className=" flex flex-col items-center justify-center gap-4">
          <div className="w-60">
            <ErrorIcon />
          </div>
          <h1 className="text-3xl text-red-500">Error</h1>
          <p className="text-red-400">{error.message}</p>
          <Link
            to="."
            prefetch="intent"
            className="bg-white text-black hover:bg-gray-400 transition ease-in-out duration-300 px-4 py-2 rounded-md"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
