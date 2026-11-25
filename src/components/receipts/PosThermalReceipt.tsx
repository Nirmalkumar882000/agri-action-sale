import React from 'react';
import { AuctionTransaction, MandiProfile } from '../../types';
import { Printer, X } from 'lucide-react';

interface PosThermalReceiptProps {
  transaction: AuctionTransaction;
  profile: MandiProfile;
  onClose: () => void;
}

const getTamilUnit = (itemType?: string, unit?: string) => {
  const str = `${itemType || ''} ${unit || ''}`.toLowerCase();
  if (str.includes('leaf') || str.includes('இலை') || str.includes('bundle') || str.includes('கட்டு')) return 'கட்டு';
  if (str.includes('crate') || str.includes('கூடை')) return 'கூடை';
  if (str.includes('bag') || str.includes('மூட்டை')) return 'மூட்டை';
  if (str.includes('box') || str.includes('பெட்டி')) return 'பெட்டி';
  if (str.includes('kg') || str.includes('கிலோ')) return 'கிலோ';
  if (str.includes('quintal') || str.includes('குவின்டால்')) return 'குவின்டால்';
  if (str.includes('piece') || str.includes('எண்ணிக்கை')) return 'எண்ணிக்கை';
  if (str.includes('ton') || str.includes('டன்')) return 'டன்';
  if (str.includes('bunch') || str.includes('தார்')) return 'தார்';
  return unit ? unit.split(' ')[0] : itemType || 'அளவு';
};

export const PosThermalReceipt: React.FC<PosThermalReceiptProps> = ({
  transaction,
  profile,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Floating Toolbar */}
        <div className="no-print p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              80mm Thermal POS Receipt
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-sm">
              #{transaction.billNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print POS</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 80mm Thermal Receipt Simulation */}
        <div className="overflow-y-auto p-3 sm:p-4 bg-white font-mono text-black text-xs leading-tight print-chit-container">
          <div className="border border-dashed border-slate-300 p-3 space-y-2">
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-dashed border-black space-y-0.5">
              <h2 className="font-black text-lg tracking-wider uppercase">
                {profile.shopName}
              </h2>
              <p className="text-[11px] font-tamil font-bold">
                {profile.taglineTamil}
              </p>
              <p className="text-[10px]">{profile.marketLocationTamil}</p>
              <p className="text-[10px]">Ph: {profile.phone}</p>
              <div className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">
                ** POS SALE SLIP / மண்டி சீட்டு **
              </div>
            </div>

            {/* Bill Info */}
            <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-black">
              <div className="flex justify-between font-bold">
                <span>Bill #: {transaction.billNumber}</span>
                <span>Date: {transaction.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Time: {transaction.time}</span>
                <span className="font-bold">Paddle: {transaction.buyerPaddle}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>Farmer: <strong className="uppercase">{transaction.sellerName}</strong></span>
                <span>[{transaction.sellerVillage}]</span>
              </div>
              <div>
                Buyer: <strong>{transaction.buyerTradeName}</strong>
              </div>
            </div>

            {/* Item Details */}
            <div className="py-1 border-b-2 border-dashed border-black">
              <div className="flex justify-between font-bold pb-1 text-[11px]">
                <span>ITEM / VARIETY</span>
                <span>AMOUNT</span>
              </div>
              <div className="flex justify-between text-xs font-black">
                <span>
                  {transaction.quantity} × {transaction.variety}
                </span>
                <span>₹{transaction.grossAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-600 font-tamil">
                {transaction.productNameTamil} @ ₹{transaction.ratePerUnit}/{getTamilUnit(transaction.itemType, transaction.unit)}
              </div>
            </div>

            {/* Tamil Deductions Breakdown */}
            <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-black font-tamil">
              <div className="flex justify-between">
                <span>வாடகை (Rent)</span>
                <span className="font-mono">{transaction.rentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>கூலி (Coolie)</span>
                <span className="font-mono">{transaction.coolieAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>மகிமை (Magimai)</span>
                <span className="font-mono">{transaction.magimaiAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>கமிஷன் ({transaction.commissionPercent}%)</span>
                <span className="font-mono">{transaction.commissionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-dotted border-black text-slate-800">
                <span>மொத்த பிடித்தம்</span>
                <span className="font-mono">{transaction.totalDeductions.toFixed(2)}</span>
              </div>
            </div>

            {/* Final Balance Box */}
            <div className="p-2 bg-slate-100 border border-black text-center space-y-0.5 my-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">
                Balance / நிகர வரவு
              </div>
              <div className="text-xl font-black font-mono">
                ₹{transaction.netFarmerPayable.toFixed(2)}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-500 pt-1">
              Thank You! Visit Again.<br />
              Authorized Mandi Gate Pass Slip
            </div>

            <div className="text-center text-[10px] text-slate-400 select-none">
              - - - - - - - - [ Cut Here ] - - - - - - - -
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
