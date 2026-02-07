// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { User } from 'lucide-react';

// const LandingPage = () => {
//   // Mock state for ENS demonstration
//   const [isConnected, setIsConnected] = useState(false);
//   const address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

//   return (
//     <div className="min-h-screen flex flex-col border-4 border-black m-4 md:m-8 swiss-grid">
      
//       {/* NAVBAR */}
//       <nav className="border-b-4 border-black h-20 flex items-center justify-between px-8 bg-white">
//         <div className="text-4xl font-black tracking-tighter uppercase">
//           Mandate<span className="text-swiss-red">.</span>
//         </div>
        
//         <div className="flex items-center">
//           {!isConnected ? (
//             <Button 
//               onClick={() => setIsConnected(true)}
//               className="rounded-none border-2 border-black bg-black text-white hover:bg-swiss-red transition-colors px-8 py-6 uppercase font-bold tracking-widest text-sm"
//             >
//               Connect Wallet
//             </Button>
//           ) : (
//             <div className="flex items-center border-2 border-black px-4 py-2 bg-white group hover:bg-black transition-colors duration-200">
//               <div className="w-8 h-8 bg-swiss-red border border-black mr-3 flex items-center justify-center overflow-hidden">
//                  {/* Mock ENS Avatar */}
//                 <User size={20} className="text-white" />
//               </div>
//               <span className="font-mono text-sm truncate max-w-[120px] md:max-w-none group-hover:text-white">
//                 {address.slice(0, 6)}...{address.slice(-4)}
//               </span>
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* HERO SECTION */}
//       <main className="flex-grow flex flex-col md:flex-row">
        
//         {/* Left Column: Messaging */}
//         <section className="flex-1 p-12 md:p-24 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col justify-center">
//           <span className="text-swiss-red font-bold mb-4 tracking-widest uppercase">01. Purpose</span>
//           <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
//             Onchain <br />
//             intent layer <br />
//             for RWA debt <br />
//             markets<span className="text-swiss-red">.</span>
//           </h1>
//           <p className="mt-12 text-xl md:text-2xl font-medium max-w-xl border-l-4 border-black pl-6">
//             Creating a public discovery layer for decentralized capital allocation.
//           </p>
//         </section>

//         {/* Right Column: Interaction & Sidebar */}
//         <div className="flex-[0.6] flex flex-col">
          
//           {/* Action Buttons */}
//           <div className="flex-grow flex flex-col">
//             <button className="flex-1 border-b-4 border-black group relative overflow-hidden bg-white hover:bg-black transition-colors duration-300">
//               <div className="relative z-10 flex flex-col items-start p-12">
//                  <span className="text-swiss-red font-bold text-sm tracking-[0.2em] mb-2 uppercase">Action</span>
//                  <h2 className="text-5xl font-black uppercase group-hover:text-white transition-colors">Lender</h2>
//               </div>
//               <div className="absolute right-8 bottom-8 text-black group-hover:text-white opacity-20 group-hover:opacity-100 transition-all text-8xl font-black">→</div>
//             </button>

//             <button className="flex-1 border-b-4 md:border-b-0 border-black group relative overflow-hidden bg-white hover:bg-swiss-red transition-colors duration-300">
//               <div className="relative z-10 flex flex-col items-start p-12">
//                  <span className="text-black font-bold text-sm tracking-[0.2em] mb-2 uppercase group-hover:text-white">Action</span>
//                  <h2 className="text-5xl font-black uppercase group-hover:text-white transition-colors">Borrower</h2>
//               </div>
//               <div className="absolute right-8 bottom-8 text-black group-hover:text-white opacity-20 group-hover:opacity-100 transition-all text-8xl font-black">→</div>
//             </button>
//           </div>

//           {/* Markets Sidebar - Matches Wireframe right side */}
//           <div className="bg-[#F2F2F2] p-8 border-t-0 md:border-t-4 border-black h-full">
//             <h3 className="uppercase font-bold tracking-widest text-sm mb-8 border-b border-black pb-2">Explore more Markets</h3>
//             <ul className="space-y-4">
//               <li className="flex justify-between items-end group cursor-pointer">
//                 <span className="text-lg font-bold uppercase">— Lending Markets</span>
//                 <span className="text-xs font-medium italic opacity-60">by PARCL</span>
//               </li>
//               <li className="flex justify-between items-end opacity-30">
//                 <span className="text-lg font-bold uppercase">— Secondary Debt</span>
//                 <span className="text-xs font-medium italic">Coming Soon</span>
//               </li>
//             </ul>
//           </div>

//         </div>
//       </main>

//     </div>
//   );
// };

// export default LandingPage;


