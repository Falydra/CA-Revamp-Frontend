import { Link, useLocation } from "react-router-dom";


interface ErrorState {
  code?: string;
  status?: string;
  message?: string;
}

export default function NotFound() {
 
  const location = useLocation();
  const state = location.state as ErrorState | undefined;

  const code = state?.code || "404";
  const status = state?.status || "Page Not Found";
  const message =
    state?.message || "The page you're looking for doesn't exist.";

  return (
    <div className="flex flex-col items-center justify-center overflow-x-auto h-screen bg-primary-bg text-primary-fg">
      {/* <DinoGame/> */}
      <h1 className="text-6xl font-bold">{code}</h1>
      <p className="text-2xl mt-4 capitalize">{status}</p>
      <p className="text-lg mt-2 text-center max-w-md">{message}</p>
      <Link 
        to="/" 
        className="mt-6 px-4 py-2 bg-primary-accent text-white rounded hover:bg-primary-accent/80 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}