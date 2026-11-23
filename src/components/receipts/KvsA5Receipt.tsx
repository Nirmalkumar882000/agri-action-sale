import React from 'react';
import { AuctionTransaction, MandiProfile } from '../../types';
import { Printer, X } from 'lucide-react';

interface KvsA5ReceiptProps {
  transaction: AuctionTransaction;
  profile: MandiProfile;
  onClose: () => void;
}

const getTamilUnit = (itemType?: string, unit?: string) => {
  const str = `${itemType || ''} ${unit || ''}`.toLowerCase();
  if (str.includes('leaf') || str.includes('இலை') || str.includes('bundle') || str.includes('கட்டு')) return 'இலை / கட்டு';
  if (str.includes('crate') || str.includes('கூடை')) return 'கூடை (Crate)';
  if (str.includes('bag') || str.includes('மூட்டை')) return 'மூட்டை (Bag)';
  if (str.includes('box') || str.includes('பெட்டி')) return 'பெட்டி (Box)';
  if (str.includes('kg') || str.includes('கிலோ')) return 'கிலோ (Kg)';
  if (str.includes('quintal') || str.includes('குவின்டால்')) return 'குவின்டால் (Qtl)';
  if (str.includes('piece') || str.includes('எண்ணிக்கை')) return 'எண்ணிக்கை (Piece)';
  if (str.includes('ton') || str.includes('டன்')) return 'டன் (Ton)';
  if (str.includes('bunch') || str.includes('தார்')) return 'தார் (Bunch)';
  return unit ? unit.split(' ')[0] : itemType || 'அளவு';
};

export const KvsA5Receipt: React.FC<KvsA5ReceiptProps> = ({ transaction, profile, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[155mm] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Floating Toolbar (Hidden on print) */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              KVS A5 Sheet Receipt / விற்பனை சீட்டு
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-sm">
              எண்: {transaction.billNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A5 Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Exact KVS A5 Portrait Page (148mm x 210mm) */}
        <div className="p-4 sm:p-6 bg-white font-mono text-black leading-tight print-chit-container">
          <div className="border-[1.5px] border-black p-4 space-y-2">
            {/* Top Phone */}
            <div className="text-right text-[12px] font-bold">
              Ph: {profile.phone.split('/')[0].trim()}
            </div>

            {/* KVS Badge Logo */}
            <div className="text-center">
              <div className="inline-block border-[2.5px] border-black rounded-xs shadow-[4px_4px_0px_#000] px-6 py-1 bg-white">
                <h1 className="text-2xl font-black tracking-widest leading-none">
                  KVS
                </h1>
              </div>
            </div>

            {/* Tamil Business Details */}
            <div className="text-center font-tamil text-[13px] font-extrabold leading-snug">
              {profile.taglineTamil}
            </div>
            <div className="text-center font-tamil text-[12px] font-bold text-slate-800">
              {profile.marketLocationTamil}
            </div>

            {/* Bill No & Date */}
            <div className="flex justify-between text-[13px] font-bold pt-1">
              <span>
                எண் <strong className="text-sm font-black">{transaction.billNumber}</strong>
              </span>
              <span>
                தேதி <strong>{transaction.date}</strong>
              </span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-[80px_1fr] gap-x-2 text-[12.5px] font-bold border-t border-dotted border-black pt-1">
              <span className="font-tamil">ஊர்</span>
              <span className="uppercase">{transaction.sellerVillage}</span>
              <span className="font-tamil">பெயர்</span>
              <span className="uppercase">{transaction.sellerName}</span>
              <span className="font-tamil">வியாபாரி</span>
              <span>
                {transaction.buyerTradeName} [{transaction.buyerPaddle}]
              </span>
              <span className="font-tamil">விளைபொருள் / அலகு</span>
              <div className="flex justify-between">
                <span className="font-tamil">{getTamilUnit(transaction.itemType, transaction.unit)}</span>
                <span className="font-black text-sm pr-4">{transaction.quantity}</span>
              </div>
            </div>

            {/* Star Separator */}
            <div className="text-center text-[10px] tracking-widest text-slate-700 select-none overflow-hidden py-0.5">
              ********************************************************
            </div>

            {/* Table Header & Row */}
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-black text-left font-bold font-tamil">
                  <th className="w-1/4 pb-1">அளவு</th>
                  <th className="w-1/2 pb-1">வகை</th>
                  <th className="w-1/4 pb-1 text-right">தொகை</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pt-1.5 font-black text-base">{transaction.quantity}</td>
                  <td className="pt-1.5 font-extrabold uppercase">
                    {transaction.variety}
                    <div className="text-[10px] font-tamil text-slate-600 font-normal">
                      {transaction.productNameTamil}
                    </div>
                  </td>
                  <td className="pt-1.5 text-right font-black text-sm">
                    {transaction.grossAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Star Separator */}
            <div className="text-center text-[10px] tracking-widest text-slate-700 select-none overflow-hidden py-0.5">
              ********************************************************
            </div>

            {/* Tamil Calculation Breakdown */}
            <div className="space-y-1 text-[13px] font-bold">
              <div className="flex justify-between font-tamil">
                <span>வாடகை</span>
                <span className="font-mono">{transaction.rentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-tamil">
                <span>கூலி</span>
                <span className="font-mono">{transaction.coolieAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-tamil">
                <span>மகிமை</span>
                <span className="font-mono">{transaction.magimaiAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-tamil">
                <span>கமிஷன் ({transaction.commissionPercent}%)</span>
                <span className="font-mono">{transaction.commissionAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Star Separator */}
            <div className="text-center text-[10px] tracking-widest text-slate-700 select-none overflow-hidden py-0.5">
              ********************************************************
            </div>

            {/* Subtotal Row */}
            <div className="flex justify-between items-center text-[14px] font-black">
              <span className="w-1/4">{transaction.quantity}</span>
              <span className="w-1/2 text-center text-slate-800">
                {transaction.totalDeductions.toFixed(2)}
              </span>
              <span className="w-1/4 text-right">{transaction.grossAmount.toFixed(2)}</span>
            </div>

            {/* Star Separator */}
            <div className="text-center text-[10px] tracking-widest text-slate-700 select-none overflow-hidden py-0.5">
              ********************************************************
            </div>

            {/* Balance Row */}
            <div className="flex justify-between items-center text-lg font-black bg-slate-100 p-2 border border-black">
              <span className="font-sans">Balance</span>
              <span className="text-xl font-mono">
                {transaction.netFarmerPayable.toFixed(2)}
              </span>
            </div>

            {/* Signatures */}
            <div className="pt-4 flex justify-between text-[11px] font-sans text-slate-700">
              <div className="text-center">
                <div className="w-24 border-b border-black mb-1"></div>
                <span>Buyer Sign</span>
              </div>
              <div className="text-center">
                <div className="w-28 border-b border-black mb-1"></div>
                <span>For KVS Traders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
