
import { Check, ArrowRight } from 'lucide-react';

const FinalQuote = () => {
  const requirements = [
    {
      title: "KYC (Know Your Customer)",
      details: ["Identity verification", "Director / promoter checks"]
    },
    {
      title: "AML & Legal Checks",
      details: ["Sanctions screening", "Regulatory & compliance review"]
    },
    {
      title: "Financial Underwriting",
      details: ["In-depth financial review", "Risk assessment & eligibility"]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6">
      <div className="max-w-4xl mx-auto border border-foreground p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#000_1px,#000_2px)] bg-position-[100%_4px]" />

        <header className="mb-20">
          <div className="flex justify-between items-start mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50">
              Protocol / Offchain Steps
            </span>
            <div className="border border-foreground px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
              Wallet: 0x...F2f8
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-display italic tracking-tighter leading-none mb-6">
            Proceed with <br /> Legal & Due Diligence
          </h1>
          <p className="font-serif text-xl italic opacity-60 border-l border-foreground pl-6">
            This stage occurs off-chain before lenders issue final binding terms.
          </p>
        </header>

        <div className="space-y-0 border-t-4 border-foreground">
          {requirements.map((req, index) => (
            <div 
              key={index} 
              className="group border-b border-foreground/20 py-10 flex flex-col md:flex-row justify-between items-start md:items-center transition-colors duration-100 hover:bg-muted"
            >
              <div className="mb-6 md:mb-0">
                <h3 className="font-display text-2xl uppercase tracking-tight mb-3">
                  {req.title}
                </h3>
                <ul className="space-y-1">
                  {req.details.map((detail, i) => (
                    <li key={i} className="font-serif text-sm opacity-60 flex items-center gap-2">
                      <span className="w-4 h-px bg-foreground/30" /> {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="flex items-center gap-4 border-2 border-foreground px-8 py-4 font-mono text-xs tracking-widest uppercase transition-none hover:bg-foreground hover:text-background">
                Mark Complete <Check size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <button className="w-full group bg-foreground text-background py-10 px-12 transition-none hover:bg-background hover:text-foreground border-4 border-foreground relative">
            <div className="flex justify-between items-center">
              <span className="text-3xl md:text-4xl font-display uppercase tracking-tighter font-medium">
                Final Quote from the Lender
              </span>
              <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform duration-100" />
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_top_center,#fff,transparent_70%)]" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default FinalQuote;
