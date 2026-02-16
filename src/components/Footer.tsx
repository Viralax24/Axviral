import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-800 text-zinc-500 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-[#f90] text-black font-bold px-2 py-0.5 rounded-sm text-sm tracking-tighter">
                Ax
           </div>
           <span className="text-white font-bold text-sm tracking-tighter">Viral24</span>
           <span className="text-xs ml-2">© 2024</span>
        </div>
        
        <div className="flex gap-6 text-sm">
           <Link to="#" className="hover:text-[#f90]">Terms</Link>
           <Link to="#" className="hover:text-[#f90]">Privacy</Link>
           <Link to="#" className="hover:text-[#f90]">DMCA</Link>
           <Link to="#" className="hover:text-[#f90]">2257</Link>
        </div>
      </div>
    </footer>
  );
}
