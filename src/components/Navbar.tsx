import { Link } from 'react-router-dom';
import { Home, Lock } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-[#f90] text-black font-bold px-2 py-1 rounded-sm text-xl tracking-tighter">
                Ax
              </div>
              <span className="text-white font-bold text-xl tracking-tighter">Viral24</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
              <Home size={20} />
              Home
            </Link>
            <Link to="/admin" className="text-gray-300 hover:text-[#f90] px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
              <Lock size={16} />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
