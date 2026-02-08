// import React, { useEffect, useMemo, useState } from "react";
// import { labelhash } from "viem";
// import { useConnection, useEnsText } from "wagmi";

// interface Field {
//   key: string;
//   value: string;
// }

// interface FetchedValuesMap {
//   [key: string]: string | undefined | null;
// }

// const Match: React.FC = () => {
//   const connection = useConnection();
//   const borrowerAddress = connection.address;
//   const lenderAddress = "0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25";


//   const [_borrowerForm, setBorrowerForm] = useState<Field[]>([
//     { key: "ROI", value: "" },
//     { key: "Loan Type", value: "" },
//     { key: "Industry", value: "" },
//     { key: "Location", value: "" },
//     { key: "Tenure", value: "" },
//   ]);

//   const borrowerNode = borrowerAddress
//     ? `${labelhash(borrowerAddress).slice(2, 6)}.borrowerlist.n4vnt.eth`
//     : "";

//   const { data: bRoi, isLoading: bRoiL } = useEnsText({
//     name: borrowerNode,
//     key: "ROI",
//   });
//   const { data: bLoanType, isLoading: bLoanL } = useEnsText({
//     name: borrowerNode,
//     key: "Loan Type",
//   });
//   const { data: bIndustry, isLoading: bIndL } = useEnsText({
//     name: borrowerNode,
//     key: "Industry",
//   });
//   const { data: bLocation, isLoading: bLocL } = useEnsText({
//     name: borrowerNode,
//     key: "Location",
//   });
//   const { data: bTenure, isLoading: bTenL } = useEnsText({
//     name: borrowerNode,
//     key: "Tenure",
//   });

//   const lenderNode = `${labelhash(lenderAddress).slice(2, 6)}.lenderlist.n4vnt.eth`;

//   const { data: lRoi } = useEnsText({ name: lenderNode, key: "ROI" });
//   const { data: lLoanType } = useEnsText({
//     name: lenderNode,
//     key: "Loan Type",
//   });
//   const { data: lIndustry } = useEnsText({ name: lenderNode, key: "Industry" });
//   const { data: lLocation } = useEnsText({ name: lenderNode, key: "Location" });
//   const { data: lTenure } = useEnsText({ name: lenderNode, key: "Tenure" });

//   const isLoading = bRoiL || bLoanL || bIndL || bLocL || bTenL;

//   useEffect(() => {
//     if (isLoading || !borrowerAddress) return;

//     const fetchedValues: FetchedValuesMap = {
//       ROI: bRoi,
//       "Loan Type": bLoanType,
//       Industry: bIndustry,
//       Location: bLocation,
//       Tenure: bTenure,
//     };

//     setBorrowerForm((prev) => {
//       const hasChanged = prev.some(
//         (f) =>
//           fetchedValues[f.key] !== undefined &&
//           f.value !== fetchedValues[f.key],
//       );
//       if (!hasChanged) return prev;

//       return prev.map((f) => ({
//         ...f,
//         value: (fetchedValues[f.key] as string) ?? f.value,
//       }));
//     });
//   }, [
//     bRoi,
//     bLoanType,
//     bIndustry,
//     bLocation,
//     bTenure,
//     isLoading,
//     borrowerAddress,
//   ]);

//   const matches = useMemo(() => {
//     const comparisonData = [
//       { label: "ROI", borrower: bRoi, lender: lRoi },
//       { label: "Loan Type", borrower: bLoanType, lender: lLoanType },
//       { label: "Industry", borrower: bIndustry, lender: lIndustry },
//       { label: "Location", borrower: bLocation, lender: lLocation },
//       { label: "Tenure", borrower: bTenure, lender: lTenure },
//     ];

//     return comparisonData.map((item) => ({
//       name: item.label,
//       isMatch: item.borrower === item.lender && item.borrower !== undefined,
//       borrowerValue: item.borrower || "N/A",
//       lenderValue: item.lender || "N/A",
//     }));
//   }, [
//     bRoi,
//     lRoi,
//     bLoanType,
//     lLoanType,
//     bIndustry,
//     lIndustry,
//     bLocation,
//     lLocation,
//     bTenure,
//     lTenure,
//   ]);
//   return (
//     <>
//       <div>
//         <span>Borrower :- {borrowerNode}</span>
//       </div>
//       <div>
//         <span>Lender :- {lenderNode}</span>
//       </div>
//       <div>
//         <h4>Match found</h4>
//         {matches.filter(item=>item.isMatch).map((e,i)=>(
//           <div key={i}>
//             {e.name}:{e.lenderValue}
//           </div>
//         ))}
//         <button>Proceed</button>
//       </div>
//     </>
//   );
// };

// export default Match;




import React, { useMemo } from "react";
import { labelhash } from "viem";
import { useConnection, useEnsText } from "wagmi";
import { ArrowRight, Fingerprint, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import FLoader from "@/components/FLoader";

const Match: React.FC = () => {
  const connection = useConnection();
  const borrowerAddress = connection.address;
  const lenderAddress = "0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25";

  const borrowerNode = borrowerAddress
    ? `${labelhash(borrowerAddress).slice(2, 6)}.borrowerlist.n4vnt.eth`
    : "Not Connected";

  const { data: bRoi, isLoading: bRoiL } = useEnsText({ name: borrowerNode, key: "ROI" });
  const { data: bLoanType, isLoading: bLoanL } = useEnsText({ name: borrowerNode, key: "Loan Type" });
  const { data: bIndustry, isLoading: bIndL } = useEnsText({ name: borrowerNode, key: "Industry" });
  const { data: bLocation, isLoading: bLocL } = useEnsText({ name: borrowerNode, key: "Location" });
  const { data: bTenure, isLoading: bTenL } = useEnsText({ name: borrowerNode, key: "Tenure" });

  const lenderNode = `${labelhash(lenderAddress).slice(2, 6)}.lenderlist.n4vnt.eth`;
  const { data: lRoi } = useEnsText({ name: lenderNode, key: "ROI" });
  const { data: lLoanType } = useEnsText({ name: lenderNode, key: "Loan Type" });
  const { data: lIndustry } = useEnsText({ name: lenderNode, key: "Industry" });
  const { data: lLocation } = useEnsText({ name: lenderNode, key: "Location" });
  const { data: lTenure } = useEnsText({ name: lenderNode, key: "Tenure" });

  const isLoading = bRoiL || bLoanL || bIndL || bLocL || bTenL;
  setTimeout(() => {
    isLoading
  }, 5000
);

  const matches = useMemo(() => {
    const comparisonData = [
      { label: "ROI", borrower: bRoi, lender: lRoi },
      { label: "Loan Type", borrower: bLoanType, lender: lLoanType },
      { label: "Industry", borrower: bIndustry, lender: lIndustry },
      { label: "Location", borrower: bLocation, lender: lLocation },
      { label: "Tenure", borrower: bTenure, lender: lTenure },
    ];

    return comparisonData.map((item) => ({
      name: item.label,
      isMatch: item.borrower === item.lender && item.borrower !== undefined,
      lenderValue: item.lender || "N/A",
    }));
  }, [bRoi, lRoi, bLoanType, lLoanType, bIndustry, lIndustry, bLocation, lLocation, bTenure, lTenure]);

  return (
    <div className="min-h-screen bg-white font-body text-black selection:bg-black selection:text-white">
      {connection.isConnecting && <FLoader/>}
      <Navbar/>

      <main className="max-w-7xl mx-auto p-8 lg:p-12">
        <div className="mb-24">
          <p className="font-mono text-sm tracking-[0.2em] uppercase mb-4 opacity-60">Protocol Engine v1.0</p>
          <h2 className="font-display text-7xl md:text-9xl font-medium leading-none tracking-tighter">
            MATCHING <br /> 
            <span className="italic">INTENTS.</span>
          </h2>
          <div className="mt-8 h-2 w-32 bg-black" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <section className="lg:col-span-5 border-2 border-black p-8 relative overflow-hidden group hover:bg-black hover:text-white transition-colors duration-100">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
               <Fingerprint size={80} strokeWidth={1} />
            </div>
            <h3 className="font-mono text-xs tracking-widest uppercase mb-8 border-b border-current pb-2">Borrower Identity</h3>
            <p className="font-display text-3xl mb-6">{borrowerNode}</p>
            <div className="space-y-2 opacity-70 font-serif italic text-lg">
              <p>Company Details Secured</p>
              <p>On-chain Financials Verified</p>
            </div>
          </section>
          <section className="lg:col-span-2 flex flex-col items-center justify-center py-12">
            <div className="w-full h-px bg-black/20 mb-8 hidden lg:block" />
            <div className="border-2 border-black p-4 rotate-45">
              <Zap className="-rotate-45" size={32} fill="currentColor" />
            </div>
            <p className="font-mono text-[10px] tracking-widest uppercase mt-4">Analyzing</p>
            <div className="w-full h-px bg-black/20 mt-8 hidden lg:block" />
          </section>

          <section className="lg:col-span-5 space-y-4">
            <h3 className="font-mono text-xs tracking-widest uppercase mb-4">Qualified Lenders</h3>
            {[lenderNode, "mandate.lender10.eth", "mandate.lender12.eth"].map((node, i) => (
              <div key={i} className="border border-black p-4 flex justify-between items-center group cursor-pointer hover:bg-black hover:text-white transition-all duration-100">
                <span className="font-mono text-sm">{node}</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            <button className="w-full text-left font-serif italic text-sm underline decoration-1 underline-offset-4 pt-2">
              + 14 more compatible lenders
            </button>
          </section>
        </div>

        <section className="mt-24 border-t-8 border-black pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="font-display text-5xl mb-8 tracking-tighter uppercase font-bold">
                <span className="text-white bg-black px-4 mr-2">Matched</span> 
                Products
              </h3>
              
              <div className="space-y-4">
                {matches.filter(item => item.isMatch).map((e, i) => (e.lenderValue !=="N/A" &&
                  <div key={i} className="flex justify-between items-center border-b border-black/10 py-4 group">
                    <span className="font-mono text-xs uppercase tracking-widest opacity-60 group-hover:opacity-100">{e.name}</span>
                    <span className="font-display text-2xl font-medium">{e.lenderValue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-end items-end space-y-8 bg-black p-12 text-white relative overflow-hidden">
               {/* Inverted texture for CTA section */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_center,#ffffff,transparent_70%)]" />
               
               <p className="font-serif text-2xl italic text-right relative z-10">
                 The verification of intents confirms a high-probability match for debt restructuring.
               </p>
               
               <Link to={"/borrower/finalquote"}><button className="w-full lg:w-auto bg-white text-black px-12 py-6 font-mono text-sm uppercase tracking-[0.3em] font-bold hover:bg-transparent hover:text-white border-2 border-white transition-all duration-100 relative z-10 flex items-center justify-center gap-4">
                 Proceed to Term Sheet <ArrowRight size={20} />
               </button>
               </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER DECORATION */}
      <footer className="h-24 bg-lines opacity-10 mt-24 border-t border-black" />
    </div>
  );
};

export default Match;