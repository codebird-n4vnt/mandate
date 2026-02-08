
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { useConnection } from 'wagmi';
import FLoader from '@/components/FLoader';

const LandingPage = () => {
const connection = useConnection();
  return (
    <div className="min-h-screen bg-texture-paper flex flex-col text-black selection:bg-black selection:text-white">
      
      {connection.isConnecting&&<FLoader/>}
      <Navbar/>
      <main className="grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full border-l border-r border-black/10">
        
        {/* Left Column: Messaging (Dominant Typography) */}
        <section className="flex-[1.2] p-8 md:p-16 lg:p-24 border-b-4 lg:border-b-0 lg:border-r-4 border-black flex flex-col justify-center relative overflow-hidden">
          {/* Background Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-px bg-black/10"></div>
          
          

          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter mb-12">
            Onchain <br />
            <span className="italic">platform</span> <br />
            for loan <br /> and debt.
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="w-full md:w-auto border-l-2 border-black pl-6 py-1">
                <p className="font-body text-xl md:text-2xl leading-relaxed text-neutral-800 max-w-md">
                  a public platform for decentralized capital allocation.
                </p>
             </div>
          </div>
        </section>

        <div className="flex-1 flex flex-col">
          
          <div className="grow flex flex-col">
            
            <Link to={"/lender"}><button className="flex-1 group relative border-b border-black p-12 text-left transition-colors duration-100 hover:bg-black hover:text-white focus-visible:outline-none">
              <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full relative z-10">
                   <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60 group-hover:opacity-80">
                     Enter Market As
                   </span>
                   <h2 className="font-display text-5xl md:text-6xl italic mt-4">Lender</h2>
                </div>
                <ArrowRight className="w-12 h-12 stroke-[0.5] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </button>
            </Link>

            <Link to={"/borrower"}><button className="flex-1 group relative border-b-4 lg:border-b-0 border-black p-12 text-left transition-colors duration-100 hover:bg-black hover:text-white focus-visible:outline-none">
               <div className="flex justify-between items-start h-full">
                <div className="flex flex-col justify-between h-full relative z-10">
                   <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-60 group-hover:opacity-80">
                     Enter Market As
                   </span>
                   <h2 className="font-display text-5xl md:text-6xl italic mt-4">Borrower</h2>
                </div>
                <ArrowRight className="w-12 h-12 stroke-[0.5] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </button>
            </Link>
          </div>

          {/* Secondary Markets - Clean List */}
          <div className="bg-neutral-50 p-12 border-t-4 border-black lg:border-t-4">
            <div className="flex items-center justify-between mb-8 border-b border-black/20 pb-4">
              <h3 className="font-mono uppercase tracking-widest text-xs">Explore Markets</h3>
              <ArrowUpRight size={16} />
            </div>
            
            <ul className="space-y-6">
              <li className="group cursor-pointer">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-display text-2xl group-hover:underline decoration-1 underline-offset-4">Lending Markets</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5">Parcl</span>
                </div>
                <p className="font-body text-sm text-neutral-500 italic">Real estate synthetic exposure</p>
              </li>
              
              <li className="opacity-40 cursor-not-allowed">
                 <div className="flex justify-between items-baseline mb-1">
                  <span className="font-display text-2xl">Secondary Debt</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest border border-black px-2 py-0.5">Soon</span>
                </div>
                <p className="font-body text-sm text-neutral-500 italic">Trading existing loan positions</p>
              </li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LandingPage;