import React from 'react';
import { AuctionTransaction, MandiProfile } from '../../types';
import { Printer, X } from 'lucide-react';

interface A5ChitReceiptProps {
  transaction: AuctionTransaction;
  profile: MandiProfile;
  onClose: () => void;
}

export const A5ChitReceipt: React.FC<A5ChitReceiptProps> = ({ transaction, profile, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalDeductions =
    transaction.coolieAmount +
    transaction.rentAmount +
    transaction.magimaiAmount +
    transaction.commissionAmount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              A5 / Thermal Sale Chit
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-sm">
              {transaction.chitNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Chit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable A5 Chit */}
        <div className="p-6 bg-white font-mono text-slate-900 leading-tight print-chit-container">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-400 space-y-1">
            <h2 className="font-extrabold text-lg tracking-wider uppercase text-slate-900">
              {profile.shopName}
            </h2>
            <p className="text-xs font-semibold font-tamil text-slate-700">
              {profile.shopNameTamil}
            </p>
            <p className="text-[10px] text-slate-600 leading-snug">
              {profile.address}
            </p>
            <p className="text-[10px] text-slate-600">
              Phone: {profile.phone} • Lic: {profile.mandiLicenseNo}
            </p>
            <div className="inline-block px-3 py-0.5 bg-slate-100 rounded-sm text-[11px] font-bold tracking-widest mt-1">
              ** AUCTION SALE CHIT / விற்பனை சிட்டு **
            </div>
          </div>

          {/* Meta Details */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Chit No: <strong className="font-bold">{transaction.chitNumber}</strong></span>
              <span>Date: <strong>{transaction.date} {transaction.time}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Farmer: <strong>{transaction.sellerName}</strong></span>
              <span>Village: <strong>{transaction.sellerVillage}</strong></span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>Buyer: <strong>{transaction.buyerTradeName}</strong></span>
              <span className="bg-slate-200 px-2 py-0.2 rounded-sm font-bold text-slate-900">
                Paddle: {transaction.buyerPaddle}
              </span>
            </div>
          </div>

          {/* Commodity Details Table */}
          <div className="py-3 border-b-2 border-dashed border-slate-400">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-left text-[11px] text-slate-600">
                  <th className="pb-1">Item / Variety</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Rate (₹)</th>
                  <th className="pb-1 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pt-2 font-bold">
                    {transaction.productName}
                    <div className="text-[10px] font-tamil text-slate-600">
                      {transaction.productNameTamil} ({transaction.variety})
                    </div>
                  </td>
                  <td className="pt-2 text-center font-bold">
                    {transaction.quantity} {transaction.unit}
                  </td>
                  <td className="pt-2 text-right font-bold">
                    {transaction.ratePerUnit.toFixed(2)}
                  </td>
                  <td className="pt-2 text-right font-extrabold text-sm">
                    {transaction.grossAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tamil Mandi Deductions Breakdown */}
          <div className="py-2.5 border-b-2 border-dashed border-slate-400 text-xs space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Calculation Breakdown / பிடித்த விபரம்:
            </div>
            <div className="flex justify-between font-tamil">
              <span>வாடகை (Rent / Stacking)</span>
              <span className="font-mono">{transaction.rentAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-tamil">
              <span>கூலி (Coolie / Weighing)</span>
              <span className="font-mono">{transaction.coolieAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-tamil">
              <span>மகிமை (Magimai / Cess)</span>
              <span className="font-mono">{transaction.magimaiAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-tamil">
              <span>கமிஷன் ({transaction.commissionPercent}%)</span>
              <span className="font-mono">{transaction.commissionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dotted border-slate-300 pt-1 text-slate-600">
              <span>மொத்த பிடித்தங்கள் (Total Deductions)</span>
              <span className="font-mono">{totalDeductions.toFixed(2)}</span>
            </div>
          </div>

          {/* Net Farmer Balance */}
          <div className="py-2.5 flex justify-between items-center text-sm font-extrabold bg-slate-100 px-3 rounded-md mt-2">
            <span className="font-tamil">நிகர வரவு (Farmer Balance):</span>
            <span className="text-base text-emerald-800">
              ₹{transaction.netFarmerPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-6 pb-1 flex justify-between text-[10px] text-slate-500 font-sans">
            <div className="text-center">
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span>Buyer Sign</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <span>For {profile.shopName}</span>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-dotted border-slate-300 mt-2">
            Computer Generated Mandi Sale Chit • Gate Pass Authorized
          </div>
        </div>
      </div>
    </div>
  );
};
