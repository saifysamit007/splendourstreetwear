import React from 'react';
import { formatPrice } from '../constants';
import { Order, SiteConfig } from '../types';
import { Mail, Phone, MapPin, Globe, Download, Printer } from 'lucide-react';

interface InvoiceProps {
  order: Order;
  config: SiteConfig['invoice'];
  onDownload?: () => void;
}

export default function Invoice({ order, config, onDownload }: InvoiceProps) {
  return (
    <div className="bg-white text-black p-6 md:p-12 max-w-[800px] mx-auto shadow-2xl rounded-sm font-sans" id={`invoice-${order.id}`}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">SPLENDOUR<span className="text-brand-red">.</span></h1>
          <div className="space-y-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            <p>{config?.companyName}</p>
            <p>{config?.address}</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><Phone size={10} /> {config?.phone}</span>
              <span className="flex items-center gap-1"><Mail size={10} /> {config?.email}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl md:text-6xl font-black opacity-10 leading-none mb-4">INVOICE</h2>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Reference Node</p>
            <p className="font-mono font-bold text-lg">{order.invoiceId}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-4">Transaction Cycle</p>
            <p className="font-bold">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 pb-2 border-b">Shipping Recipient</h3>
          <p className="font-bold text-xl">{order.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">{order.customerEmail}</p>
          {order.customerPhone && <p className="text-sm text-gray-600 font-mono mt-1">{order.customerPhone}</p>}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 italic">
            {order.shippingAddress || 'Digital distribution protocol active.'}
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 pb-2 border-b">Billing & Payment</h3>
          <p className="font-bold text-lg uppercase italic mb-1">
            {order.paymentMethod === 'bkash' ? 'bKash Transaction' : 'Cash on Delivery'}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Billing Address:</p>
            <p className="text-xs text-gray-600 leading-relaxed italic">{order.billingAddress || 'System Default'}</p>
          </div>
          
          {order.paymentMethod === 'bkash' && order.paymentDetails && (
            <div className="mt-4 p-3 bg-brand-red/5 border border-brand-red/10 rounded-xl space-y-1">
               <p className="text-[8px] font-black uppercase tracking-widest text-brand-red">Transfer Verification</p>
               <p className="text-[10px] font-mono leading-none flex justify-between">
                 <span>Account:</span>
                 <span className="font-bold">{order.paymentDetails.bkashNumber}</span>
               </p>
               <p className="text-[10px] font-mono leading-none flex justify-between">
                 <span>TXID:</span>
                 <span className="font-bold">{order.paymentDetails.transactionId}</span>
               </p>
            </div>
          )}

          <div className="mt-6">
             <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
               Status: {order.status}
             </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto no-scrollbar mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest min-w-[150px]">Asset Description</th>
              <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest min-w-[50px]">Units</th>
              <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest min-w-[100px]">Unit Price</th>
              <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest min-w-[100px]">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-6">
                  <span className="font-bold text-sm">{item.name}</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Ref: {item.id.slice(0, 8)}</p>
                </td>
                <td className="py-6 text-center font-mono text-sm">{item.quantity}</td>
                <td className="py-6 text-right font-mono text-sm">{formatPrice(item.price)}</td>
                <td className="py-6 text-right font-mono font-bold text-sm">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Market Subtotal</span>
            <span className="font-mono">{formatPrice(order.total - order.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Logistics Fee</span>
            <span className="font-mono">{formatPrice(order.deliveryCharge)}</span>
          </div>
          <div className="h-[1px] bg-gray-100" />
          <div className="flex justify-between text-xl font-black italic">
            <span>TOTAL DUE</span>
            <span className="text-brand-red underline underline-offset-8 decoration-gray-200">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-12 border-t-2 border-black flex justify-between items-end">
        <div className="max-w-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Architect's Note</p>
          <p className="text-xs text-gray-500 leading-relaxed italic">
            {config?.notes}
          </p>
        </div>
        <div className="flex items-center gap-6 opacity-30 grayscale pointer-events-none">
           <Download size={24} />
           <Printer size={24} />
           <Globe size={24} />
        </div>
      </div>

      <div className="mt-8 text-center">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-300">Splendour Collective Security Alliance &copy; 2026</p>
      </div>

      {/* Action Buttons for UI (Hidden when printing if needed) */}
      <div className="absolute top-8 right-[-100px] flex flex-col gap-4 print:hidden">
         <button 
           onClick={() => window.print()}
           className="p-4 bg-brand-card border border-white/10 rounded-full text-white hover:bg-brand-red transition-all shadow-xl"
         >
           <Printer size={20} />
         </button>
      </div>
    </div>
  );
}
