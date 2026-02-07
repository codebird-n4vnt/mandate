import { useConnection, useWriteContractSync } from "wagmi"; // Fixed import
import { labelhash, namehash, encodeFunctionData } from "viem";
import { ResolverABI, SubDomainABI } from "../ens/ABI";
import Wallet from "../components/Wallet";
import { useState } from "react";
import { Plus, X, ArrowRight, Shield } from "lucide-react";

const LenderProfile = () => {
  const connection = useConnection();
  const subnameOwner = connection?.address;

  // Safety check: ensure address exists before hashing
  const newhash = labelhash(subnameOwner?.toString() as string).slice(2, 6) // Assuming you want a hash of a slice

  const hashedlabel = labelhash(newhash);

  // Use the standard hook for writing to contracts
  const writeContractSync = useWriteContractSync();

  const nodeString = `${newhash}.borrowerlist.n4vnt.eth`;
  const node = namehash(nodeString);

  // State
  const [formFields, setFormFields] = useState([
    {
      heading: "Your preferred ROI(%)",
      key: "ROI",
      value: "",
      isFixed: true,
      type: "select",
      options: ["5-10", "10-15", "15-20", "20+"],
    },
    {
      heading: "Loan Type",
      key: "Loan Type",
      value: "",
      isFixed: true,
      type: "select",
      options: ["Personal", "Business", "Education", "Mortgage"],
    },
    {
      heading: "Industry",
      key: "Industry",
      value: "",
      isFixed: true,
      options: [
        "Agriculture & Allied Industries",
        "Automobiles & Auto Components",
        "Aviation & Aerospace",
        "Banking, Financial Services & FinTech",
        "Construction, Real Estate & Infrastructure",
        "Consumer Goods (FMCG, D2C, Retail)",
        "E-commerce & Marketplaces",
        "Food, Beverage & Hospitality",
        "Healthcare & Pharma",
        "Education & EdTech",
        "Energy & Renewables",
        "IT Services & SaaS",
        "AI, Data & Cloud",
        "Cybersecurity",
        "Logistics & Supply Chain",
        "Manufacturing & Industrial",
        "Media, Gaming & Entertainment",
        "Telecom",
        "Web3, Blockchain & Crypto",
        "Electronics, Hardware & IoT",
      ],
    },
    {
      heading: "Location",
      key: "Location",
      value: "",
      isFixed: true,
      options: [
        "USA",
        "UAE",
        "Australia",
        "Europe",
        "India",
        "Singapore",
        "United Kingdom",
        "China",
        "Japan",
        "Argentina",
      ],
    },
    {
      heading: "Tenure(months)",
      key: "Tenure",
      value: "",
      isFixed: true,
      options: ["18", "24", "30", "36","48"],
    },
  ]);

  // --- Handlers ---

  const createSubname = async () => {
    try {
      await writeContractSync.mutateAsync({
        abi: SubDomainABI,
        address: "0xEc42444a4B113E0ee11cb919239b0Cc1f2f8ACCF",
        functionName: "createSubdomain",
        args: [
          hashedlabel,
          "0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521",
        ],
      });
    } catch (error) {
      console.error("Error creating subname:", error);
    }
  };

  const handleInputChange = (
    index: number,
    fieldType: string,
    newValue: string,
  ) => {
    const updatedFields = formFields.map((field, i) => {
      if (i === index) return { ...field, [fieldType]: newValue };
      return field;
    });
    setFormFields(updatedFields);
  };

  const handleRemoveKey = (indexToRemove: number) => {
    setFormFields(formFields.filter((_, index) => index !== indexToRemove));
  };

  const handleAddKey = () => {
    setFormFields([
      ...formFields,
      {
        heading: "Custom field",
        key: "",
        value: "",
        isFixed: false,
        options: [""], // FIX: Explicitly set undefined so it renders as Input
      },
    ]);
  };

  const setRecord = async () => {
    try {
      const calls = formFields.map(({ key, value }) =>
        encodeFunctionData({
          abi: ResolverABI,
          functionName: "setText",
          args: [node, key, value],
        }),
      );

      await writeContractSync.mutateAsync({
        abi: ResolverABI,
        address: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
        functionName: "multicall",
        args: [calls],
      });
    } catch (error) {
      console.error("Error setting records:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* 1. Global Header */}
      <nav className="border-b border-foreground px-6 md:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center text-background font-bold">
            B
          </div>
          <span className="font-mono text-xs tracking-widest uppercase hidden md:block">
            Registry / v.01
          </span>
        </div>
        <Wallet />
      </nav>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-20">
        {/* 2. Hero Section */}
        <header className="mb-24">
          <h1 className="text-7xl md:text-9xl font-display italic leading-none tracking-tighter mb-8">
            Identity.
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6">
              <p className="text-xl font-serif leading-relaxed opacity-80">
                Manage your borrower profile on{" "}
                <span className="underline decoration-1 underline-offset-4">
                  n4vnt.eth
                </span>
                . Your on-chain presence is defined by the accuracy of your
                declarations.
              </p>
            </div>
            <div className="md:col-start-9 md:col-span-4 border-t-4 border-foreground pt-4">
              <p className="font-mono text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield size={12} /> Status: Connected
              </p>
              <button
                onClick={createSubname}
                className="w-full bg-foreground text-background py-4 px-8 font-medium tracking-widest uppercase text-xs transition-none hover:bg-background hover:text-foreground border border-transparent hover:border-foreground flex justify-between items-center"
              >
                Create Subname <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* 3. The Form */}
        <div className="border-t-8 border-foreground pt-12">
          <div className="flex justify-between items-baseline mb-12">
            <h2 className="font-display text-4xl uppercase tracking-tight">
              Records
            </h2>
            <span className="font-mono text-xs opacity-50">
              {formFields.length} ACTIVE_KEYS
            </span>
          </div>

          <div className="space-y-0 border-t border-foreground/20">
            {formFields.map((fieldData, index) => (
              <div
                key={index}
                className="group border-b border-foreground/20 py-10 transition-colors duration-100 hover:bg-muted/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Metadata Label */}
                  <div className="md:col-span-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Field_{index.toString().padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-xl uppercase tracking-wide">
                      {fieldData.heading}
                    </h3>
                  </div>

                  {/* Input Matrix */}
                  <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* KEY INPUT */}
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest opacity-50">
                        Key
                      </label>
                      <input
                        type="text"
                        disabled={fieldData.isFixed}
                        className={`w-full bg-transparent border-b border-foreground/30 py-2 font-mono text-sm focus:border-foreground focus:outline-none transition-all ${
                          fieldData.isFixed ? "opacity-40 italic" : ""
                        }`}
                        value={fieldData.key}
                        onChange={(e) =>
                          handleInputChange(index, "key", e.target.value)
                        }
                      />
                    </div>

                    {/* VALUE INPUT (Dynamic) */}
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] uppercase tracking-widest opacity-50">
                        Value
                      </label>

                      {fieldData.options && fieldData.options.length > 1 ? (
                        // DROPDOWN RENDER
                        <select
                          className="w-full bg-transparent border-b border-foreground/30 py-2 font-serif text-lg focus:border-b-2 focus:border-foreground focus:outline-none transition-all placeholder:text-foreground/20"
                          value={fieldData.value}
                          onChange={(e) =>
                            handleInputChange(index, "value", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {fieldData.options.map((opt, i) => (
                            <option
                              key={i}
                              value={opt}
                              className="bg-background text-foreground"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        // TEXT INPUT RENDER
                        <input
                          type="text"
                          className="w-full bg-transparent border-b border-foreground/30 py-2 font-serif text-lg focus:border-b-2 focus:border-foreground focus:outline-none transition-all placeholder:text-foreground/20"
                          placeholder="Enter Value"
                          value={fieldData.value}
                          onChange={(e) =>
                            handleInputChange(index, "value", e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>

                  {/* Remove Action */}
                  <div className="md:col-span-1 flex items-end justify-end">
                    {!fieldData.isFixed && (
                      <button
                        onClick={() => handleRemoveKey(index)}
                        className="p-2 border border-foreground/20 hover:bg-foreground hover:text-background transition-none"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Footer Actions */}
          <div className="mt-16 flex flex-col md:flex-row gap-4">
            <button
              onClick={handleAddKey}
              className="flex-1 border-2 border-foreground py-6 font-medium tracking-widest uppercase text-xs hover:bg-foreground hover:text-background transition-none flex items-center justify-center gap-3"
            >
              <Plus size={16} /> Add Custom Entry
            </button>
            <button
              onClick={setRecord}
              className="flex-1 bg-foreground text-background py-6 font-medium tracking-widest uppercase text-xs hover:bg-background hover:text-foreground border-2 border-transparent hover:border-foreground transition-none shadow-2xl"
            >
              Submit to Registry
            </button>
          </div>
        </div>
      </main>

      {/* 5. Section Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,#000_40px,#000_41px)]" />
    </div>
  );
};

export default LenderProfile;
