import { AlertTriangle, Hexagon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
          <div className="relative">
            <Hexagon className="w-20 h-20 text-primary animate-pulse" />
            <AlertTriangle className="absolute text-primary inset-0 m-auto w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-xl text-gray-600">Oops! Page not found</p>
          <Link
            href="/"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    </>
  );
}
