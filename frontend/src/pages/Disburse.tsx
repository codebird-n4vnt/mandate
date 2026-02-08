import { Navbar } from "@/components/Navbar";
import { useRef, useState } from "react";
import { Transfer } from "../components/Transfer";
import { useConnection } from "wagmi";
import FLoader from "@/components/FLoader";

const TransferRow = ({
  type,
  tenure,
  amount,
  isLast = false,
}: {
  type: string;
  tenure: string;
  amount: string;
  isLast?: boolean;
}) => {
  return (
    <div
      className={`group grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-8 ${!isLast ? "border-b border-black" : ""}`}
    >
      <div className="md:col-span-4">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1 block md:hidden">
          Debt Type
        </span>
        <div className="border border-black p-4 transition-all duration-300 group-hover:bg-black group-hover:text-white">
          <span className="font-display text-xl uppercase tracking-wide">
            {type}
          </span>
        </div>
      </div>

      {/* Connector */}
      <div className="md:col-span-1 text-center hidden md:block">
        <span className="font-body italic text-lg text-neutral-600">for</span>
      </div>

      {/* Column 2: Tenure */}
      <div className="md:col-span-3">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1 block md:hidden">
          Tenure
        </span>
        <div className="border border-black p-4 text-center transition-all duration-300 group-hover:bg-black group-hover:text-white">
          <span className="font-mono text-lg">{tenure}</span>
        </div>
      </div>

      {/* Connector */}
      <div className="md:col-span-1 text-center hidden md:block">
        <span className="font-body italic text-lg text-neutral-600">at</span>
      </div>

      {/* Column 3: Amount */}
      <div className="md:col-span-3 text-right">
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-1 block md:hidden">
          Amount
        </span>
        <div className="border border-black p-4 text-right transition-all duration-300 group-hover:bg-black group-hover:text-white">
          <span className="font-mono text-lg font-medium">{amount}</span>
        </div>
      </div>
    </div>
  );
};

export default function Disburse() {
  const sectionRef = useRef<HTMLDivElement>(null);
    const connection = useConnection();
  const scrollToSection = () => {
    sectionRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const [isHoveringDisburse, setIsHoveringDisburse] = useState(false);

  // Data derived from wireframe
  const items = [
    { type: "Term Loan", tenure: "12 MONTHS", amount: "$5,000,000.00" },
    { type: "Equity Debt", tenure: "45 MONTHS", amount: "$3,500,000.00" },
    { type: "Cashflow Financing", tenure: "6 MONTHS", amount: "$1,500,000.00" },
  ];

  const totalAmount = "10,000,000.00";
  const currency = "USDC";

  return (
    <div className="min-h-screen relative overflow-hidden">
        {connection.isConnecting&&<FLoader/>}
      <Navbar />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-texture-paper bg-repeat"></div>

      <main className="relative max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* --- Header Section --- */}
        <header className="mb-24 space-y-8">
          <div className="border-t-4 border-black w-full mb-8"></div>

          <h1 className="text-6xl md:text-8xl font-display leading-[0.9] tracking-tighter">
            Borrower Terms <br />
            <span className="italic">Accepted</span>.
          </h1>

          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12 pt-8">
            <p className="font-body text-xl md:text-2xl max-w-2xl leading-relaxed text-neutral-800">
              Borrower has formally accepted the terms for the structured
              financial products detailed below.
            </p>
            {/* <div className="h-px bg-black grow mb-4 hidden md:block"></div> */}
            {/* <span className="font-mono text-xs tracking-widest uppercase shrink-0 mb-3">
              REF: #TRX-8829-2026
            </span> */}
          </div>
        </header>

        {/* --- Table Section --- */}
        <section className="mb-32">
          <div className="flex items-baseline justify-between mb-12 border-b-2 border-black pb-4">
            <h2 className="text-4xl md:text-5xl font-display">
              Initiate Funds Transfer
            </h2>
            <span className="font-mono text-sm hidden md:inline-block">
              [ 03 ITEMS SELECTED ]
            </span>
          </div>

          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-mono uppercase tracking-widest mb-4 opacity-60">
            <div className="col-span-4">Debt Instrument</div>
            <div className="col-span-1"></div>
            <div className="col-span-3 text-center">Duration</div>
            <div className="col-span-1"></div>
            <div className="col-span-3 text-right">Allocation</div>
          </div>

          {/* Rows */}
          <div className="border-t border-black">
            {items.map((item, idx) => (
              <TransferRow
                key={idx}
                {...item}
                isLast={idx === items.length - 1}
              />
            ))}
          </div>
        </section>

        {/* --- Footer / Action Section --- */}
        {/* Replaces the wireframe's bottom box with a high-impact inverted section */}
        <footer className="relative">
          <button
            className="w-full group focus:outline-none"
            onMouseEnter={() => setIsHoveringDisburse(true)}
            onMouseLeave={() => setIsHoveringDisburse(false)}
            onClick={scrollToSection}
          >
            {/* The Container */}
            <div
              className={`
              w-full border-4 border-black p-8 md:p-12
              flex flex-col md:flex-row items-center justify-between gap-8
              transition-colors duration-100 ease-linear
              ${isHoveringDisburse ? "bg-black text-white" : "bg-white text-black"}
            `}
            >
              {/* Action Label */}
              <div className="text-left">
                <span
                  className={`
                  font-mono text-xs uppercase tracking-widest mb-2 block
                  ${isHoveringDisburse ? "text-neutral-400" : "text-neutral-500"}
                `}
                >
                  Final Action
                </span>
                <span className="font-display text-4xl md:text-5xl italic tracking-tight">
                  Disburse Now &rarr;
                </span>
              </div>

              {/* Total Amount Display */}
              <div className="text-right flex flex-col items-end">
                <span
                  className={`
                  font-mono text-xs uppercase tracking-widest mb-1 block
                  ${isHoveringDisburse ? "text-neutral-400" : "text-neutral-500"}
                `}
                >
                  Total Disbursement
                </span>

                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-4xl md:text-6xl tracking-tighter">
                    {totalAmount}
                  </span>
                  <span
                    className={`
                    font-mono text-xl border px-2 py-1
                    ${isHoveringDisburse ? "border-white" : "border-black"}
                  `}
                  >
                    {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Focus Ring Helper (Accessibility) */}
            <div className="absolute inset-0 pointer-events-none group-focus-visible:ring-4 ring-offset-4 ring-black"></div>
          </button>

          <p className="text-center font-mono text-xs text-neutral-400 mt-8 uppercase tracking-widest">
            SECURE TRANSACTION OVER ARC
          </p>
        </footer>
        <div ref={sectionRef}>
          <Transfer />
        </div>
      </main>
    </div>
  );
}
