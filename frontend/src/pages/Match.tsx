import React, { useEffect, useMemo, useState } from "react";
import { labelhash } from "viem";
import { useConnection, useEnsText } from "wagmi";

interface Field {
  key: string;
  value: string;
}

interface FetchedValuesMap {
  [key: string]: string | undefined | null;
}

const Match: React.FC = () => {
  const connection = useConnection();
  const borrowerAddress = connection.address;
  const lenderAddress = "0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25";


  const [_borrowerForm, setBorrowerForm] = useState<Field[]>([
    { key: "ROI", value: "" },
    { key: "Loan Type", value: "" },
    { key: "Industry", value: "" },
    { key: "Location", value: "" },
    { key: "Tenure", value: "" },
  ]);

  const borrowerNode = borrowerAddress
    ? `${labelhash(borrowerAddress).slice(2, 6)}.borrowerlist.n4vnt.eth`
    : "";

  const { data: bRoi, isLoading: bRoiL } = useEnsText({
    name: borrowerNode,
    key: "ROI",
  });
  const { data: bLoanType, isLoading: bLoanL } = useEnsText({
    name: borrowerNode,
    key: "Loan Type",
  });
  const { data: bIndustry, isLoading: bIndL } = useEnsText({
    name: borrowerNode,
    key: "Industry",
  });
  const { data: bLocation, isLoading: bLocL } = useEnsText({
    name: borrowerNode,
    key: "Location",
  });
  const { data: bTenure, isLoading: bTenL } = useEnsText({
    name: borrowerNode,
    key: "Tenure",
  });

  const lenderNode = `${labelhash(lenderAddress).slice(2, 6)}.lenderlist.n4vnt.eth`;

  const { data: lRoi } = useEnsText({ name: lenderNode, key: "ROI" });
  const { data: lLoanType } = useEnsText({
    name: lenderNode,
    key: "Loan Type",
  });
  const { data: lIndustry } = useEnsText({ name: lenderNode, key: "Industry" });
  const { data: lLocation } = useEnsText({ name: lenderNode, key: "Location" });
  const { data: lTenure } = useEnsText({ name: lenderNode, key: "Tenure" });

  const isLoading = bRoiL || bLoanL || bIndL || bLocL || bTenL;

  useEffect(() => {
    if (isLoading || !borrowerAddress) return;

    const fetchedValues: FetchedValuesMap = {
      ROI: bRoi,
      "Loan Type": bLoanType,
      Industry: bIndustry,
      Location: bLocation,
      Tenure: bTenure,
    };

    setBorrowerForm((prev) => {
      const hasChanged = prev.some(
        (f) =>
          fetchedValues[f.key] !== undefined &&
          f.value !== fetchedValues[f.key],
      );
      if (!hasChanged) return prev;

      return prev.map((f) => ({
        ...f,
        value: (fetchedValues[f.key] as string) ?? f.value,
      }));
    });
  }, [
    bRoi,
    bLoanType,
    bIndustry,
    bLocation,
    bTenure,
    isLoading,
    borrowerAddress,
  ]);

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
      borrowerValue: item.borrower || "N/A",
      lenderValue: item.lender || "N/A",
    }));
  }, [
    bRoi,
    lRoi,
    bLoanType,
    lLoanType,
    bIndustry,
    lIndustry,
    bLocation,
    lLocation,
    bTenure,
    lTenure,
  ]);
  return (
    <>
      <div>
        <span>Borrower :- {borrowerNode}</span>
      </div>
      <div>
        <span>Lender :- {lenderNode}</span>
      </div>
      <div>
        <h4>Match found</h4>
        {matches.filter(item=>item.isMatch).map((e,i)=>(
          <div key={i}>
            {e.name}:{e.lenderValue}
          </div>
        ))}
        <button>Proceed</button>
      </div>
    </>
  );
};

export default Match;
