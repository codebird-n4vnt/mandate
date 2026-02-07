import { ShieldCheck } from "lucide-react";


const TermSheet = () => {
  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#000_1px,#000_2px)] bg-postion-[100%_4px]" />

      
      <nav className="w-full max-w-7xl flex justify-between items-end border-b-4 border-black pb-8 mb-16">
        <div className="font-mono text-xs tracking-widest uppercase">
          Review and Accept Terms // 2026
        </div>
        <div className="font-mono text-sm border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors duration-100 cursor-help">
          0x71C...4e8D
        </div>
      </nav>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        <div className="lg:col-span-4">
          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tighter uppercase wrap-break-words">
            Final <br />
            Term <br />
            Sheet
          </h1>
          <div className="mt-8 h-2 w-24 bg-black" /> {/* Heavy Rule Punctuation */}
        </div>

        <div className="lg:col-span-8 border-2 border-black p-8 md:p-12 bg-white relative">
          <div className="mb-12">
            <h2 className="font-display italic text-4xl mb-2">Intents</h2>
            <p className="font-mono text-sm text-muted-foreground tracking-tight">
              Matched for borrower and lender requirements
            </p>
          </div>

          <div className="space-y-0 border-t border-black">
            {[
              { type: 'TERM LOAN', tenure: '12 MONTHS', amount: '$5,000,000.00' },
              { type: 'EQUITY DEBT', tenure: '45 MONTHS', amount: '$3,500,000.00' },
              { type: 'CASHFLOW', tenure: '6 MONTHS', amount: '$1,500,000.00' },
            ].map((row, i) => (
              <div 
                key={i} 
                className="grid grid-cols-3 gap-4 py-6 border-b border-black group hover:bg-black hover:text-white transition-colors duration-100 px-4 -mx-4 cursor-default"
              >
                <div className="font-display text-xl self-center">{row.type}</div>
                <div className="font-mono text-sm self-center text-center italic">for {row.tenure}</div>
                <div className="font-display text-2xl text-right self-center">{row.amount}</div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center">
            <button className="group relative w-full bg-black text-white py-6 px-12 font-mono text-lg tracking-[0.2em] uppercase transition-all duration-100 hover:bg-white hover:text-black border-2 border-black focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-4">
              Get $10,000,000 now in $USDC →
            </button>
            <p className="mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex gap-1.5 items-center ">
              <ShieldCheck size={16} />
                <span className="font-mono text-[9px] uppercase tracking-widest">On-Chain Binding</span>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-32 w-full max-w-7xl border-t-8 border-black pt-4">
        <div className="font-mono text-[10px] opacity-30 uppercase">
          Confidential Editorial Format // No. 001-A
        </div>
      </footer>
    </div>
  );
};

export default TermSheet;