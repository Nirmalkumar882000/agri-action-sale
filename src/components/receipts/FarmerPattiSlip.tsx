import React from 'react';
import { Seller, MandiProfile, AuctionTransaction } from '../../types';
import { Printer, X } from 'lucide-react';

interface FarmerPattiSlipProps {
  seller: Seller;
  transactions: AuctionTransaction[];
  profile: MandiProfile;
  advanceRecovery: number;
  onClose: () => void;
}

export const FarmerPattiSlip: React.FC<FarmerPattiSlipProps> = ({
  seller,
  transactions,
  profile,
  advanceRecovery,
  onClose,
}) => {
  const sellerTxs = transactions.filter(tx => tx.sellerId === seller.id);

  const grossTotal = sellerTxs.reduce((sum, tx) => sum + tx.grossAmount, 0);
  const totalCoolie = sellerTxs.reduce((sum, tx) => sum + tx.coolieAmount, 0);
  const totalRent = sellerTxs.reduce((sum, tx) => sum + tx.rentAmount, 0);
  const totalMagimai = sellerTxs.reduce((sum, tx) => sum + tx.magimaiAmount, 0);
  const totalCommission = sellerTxs.reduce((sum, tx) => sum + tx.commissionAmount, 0);

  const totalDeductions =
    totalCoolie + totalRent + totalMagimai + totalCommission + advanceRecovery;
  const netPayable = Math.max(0, grossTotal - totalDeductions);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden in print) */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Farmer Settlement Patti / விற்பனை ரசீது
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Patti</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Patti */}
        <div className="overflow-y-auto overflow-x-auto p-4 sm:p-8 bg-white font-mono text-slate-900 leading-tight print-chit-container space-y-4">
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
            <h2 className="font-extrabold text-xl tracking-wider uppercase text-slate-900">
              {profile.shopName}
            </h2>
            <p className="text-sm font-semibold font-tamil text-slate-800">
              {profile.shopNameTamil}
            </p>
            <p className="text-xs text-slate-600">{profile.address}</p>
            <p className="text-xs text-slate-600">
              Phone: {profile.phone} • Mandi Lic: {profile.mandiLicenseNo}
            </p>
            <div className="inline-block px-4 py-1 bg-slate-100 rounded-sm text-xs font-bold tracking-widest mt-1">
              ** FARMER SETTLEMENT PATTI / உழவர் விற்பனை பட்டி **
            </div>
          </div>

          {/* Farmer & Bill Meta Details */}
          <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-300">
            <div className="space-y-1">
              <div>Farmer Name: <strong className="font-sans font-bold">{seller.name}</strong></div>
              <div>Village: <strong>{seller.village}, {seller.district}</strong></div>
              <div>Phone: <strong>{seller.mobile}</strong></div>
            </div>
            <div className="text-right space-y-1">
              <div>Patti No: <strong className="font-bold">PATTI-2026-{seller.code}</strong></div>
              <div>Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
              <div>Bank: <strong>{seller.bankDetails.bankName}</strong></div>
            </div>
          </div>

          {/* Lots Sold Itemized Table */}
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-400 text-left text-[11px] font-bold">
                  <th className="pb-1.5">Chit #</th>
                  <th className="pb-1.5">Produce / Variety</th>
                  <th className="pb-1.5 text-center">Qty</th>
                  <th className="pb-1.5 text-right">Rate (₹)</th>
                  <th className="pb-1.5 text-right">Gross (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sellerTxs.map(tx => (
                  <tr key={tx.id}>
                    <td className="py-2 font-bold">{tx.chitNumber}</td>
                    <td className="py-2">
                      <div className="font-bold">{tx.productName}</div>
                      <div className="text-[10px] text-slate-500 font-tamil">{tx.productNameTamil}</div>
                    </td>
                    <td className="py-2 text-center font-bold">
                      {tx.quantity} {tx.unit}
                    </td>
                    <td className="py-2 text-right">₹{tx.ratePerUnit.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold">₹{tx.grossAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deductions Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
              <span>மொத்த விற்பனை மதிப்பு (Gross Value):</span>
              <span>₹{grossTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-tamil">
              <span>வாடகை (Rent / Stacking Charges):</span>
              <span className="font-mono">(-) ₹{totalRent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-tamil">
              <span>கூலி (Coolie / Weighing Charges):</span>
              <span className="font-mono">(-) ₹{totalCoolie.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-tamil">
              <span>மகிமை (Magimai Cess):</span>
              <span className="font-mono">(-) ₹{totalMagimai.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-tamil">
              <span>மண்டி கமிஷன் (Commission {profile.defaultCommissionPercent}%):</span>
              <span className="font-mono">(-) ₹{totalCommission.toFixed(2)}</span>
            </div>
            {advanceRecovery > 0 && (
              <div className="flex justify-between text-purple-800 font-bold">
                <span>முன்பணம் பிடித்தம் (Advance Recovery):</span>
                <span className="font-mono">(-) ₹{advanceRecovery.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
              <span>மொத்த பிடித்தங்கள் (Total Deductions):</span>
              <span className="text-red-700">₹{totalDeductions.toFixed(2)}</span>
            </div>
          </div>

          {/* Net Amount Box */}
          <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600 flex justify-between items-center text-sm font-black text-emerald-950">
            <span className="font-tamil">விவசாயிக்கு வழங்கப்படும் நிகர தொகை (Net Payable):</span>
            <span className="text-xl font-mono text-emerald-800">
              ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-8 pb-2 flex justify-between text-xs text-slate-600 font-sans">
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>விவசாயி கையொப்பம் (Farmer Sign)</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span>For {profile.shopName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
