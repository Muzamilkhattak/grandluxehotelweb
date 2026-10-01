import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#362618] border-b border-[#7E652E]/30 transition-all duration-300 py-4 md:py-6 hover:py-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Left Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link 
            href="/rooms" 
            className="text-[#FAF8F5]/90 hover:text-white font-jost text-sm uppercase tracking-wider relative group transition-colors font-medium text-[#D4AF37]"
          >
            Suites & Villas
            <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#C97A4F] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300"></span>
          </Link>
          {["Experiences", "Wellness & Spa", "Dining"].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-[#FAF8F5]/90 hover:text-white font-jost text-sm uppercase tracking-wider relative group transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#C97A4F] scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300"></span>
            </Link>
          ))}
        </nav>

        {/* Center Brandmark */}
        <div className="flex-1 lg:flex-none text-center">
          <Link href="/" className="font-marcellus text-2xl md:text-3xl text-white tracking-[0.2em] uppercase">
            Grand Luxe
          </Link>
        </div>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-[#FAF8F5]/90 font-jost text-sm tracking-wider">
            USD / EUR
          </div>
          <Link href="#" className="text-[#FAF8F5]/90 font-jost text-sm uppercase tracking-wider hover:text-white transition-colors">
            Concierge
          </Link>
          <Link 
            href="/rooms"
            className="bg-transparent border border-[#FAF8F5]/30 text-[#FAF8F5] font-vogue uppercase tracking-widest text-[13px] px-6 py-2.5 rounded-full hover:bg-[#FAF8F5] hover:text-[#362618] transition-all duration-300 inline-block"
          >
            Check Availability
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="lg:hidden text-[#FAF8F5] p-2 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>

      </div>
    </header>
  );
}
