import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-black text-white/[0.06] select-none tracking-tighter">404</p>
      <h1 className="mt-2 text-2xl font-bold text-white tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-white/50 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/feed"
        className="mt-8 btn-primary px-6 py-2.5 rounded-md inline-block text-sm"
      >
        Go to class updates
      </Link>
    </div>
  )
}
