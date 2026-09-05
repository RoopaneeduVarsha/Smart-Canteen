import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  Zap,
  PlusCircle,
  FastForward,
  RotateCcw,
  Flame,
  Cpu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function DemoSimulatorBar() {
  const {
    isRushMode,
    setIsRushMode,
    orders,
    updateOrderStatus,
    resetDemoState,
    addNotification,
  } = useCanteen();

  const [isOpen, setIsOpen] = useState(false);

  // Simulate instant test order injection
  const handleInjectOrder = () => {
    const randomStudents = [
      { name: 'Kavya Patel', id: 'CS-2024-9912', item: 'Paneer Tikka Roll', price: 75 },
      { name: 'Arjun Das', id: 'EE-2023-3321', item: 'Crispy Veg Burger', price: 60 },
      { name: 'Sneha Roy', id: 'ME-2024-5541', item: 'Special Chicken Dum Biryani', price: 130 },
      { name: 'Tanmay Bhatt', id: 'IT-2025-1029', item: 'Masala Chai & Samosa Duo', price: 35 },
    ];
    const pick = randomStudents[Math.floor(Math.random() * randomStudents.length)];
    const token = `A${130 + Math.floor(Math.random() * 800)}`;
    
    const simulated = {
      order_id: `ORD-${2000 + Math.floor(Math.random() * 9000)}`,
      token_number: token,
      user_id: 'usr_simulated',
      customer_name: pick.name,
      student_id: pick.id,
      items: [{ item_id: 'item_sim', name: pick.item, quantity: 1, price: pick.price }],
      total_amount: pick.price,
      pickup_time: isRushMode ? '1:45 PM' : '1:30 PM',
      payment_status: 'PAID (Simulated UPI)',
      order_status: 'placed',
      counter: Math.random() > 0.5 ? 'Counter 1' : 'Counter 2',
      created_at: new Date().toISOString(),
      prep_time_min: 8,
      queue_position: orders.length + 1,
    };

    window.dispatchEvent(new CustomEvent('smartbite_inject_order', { detail: simulated }));
    addNotification('⚡ Demo Simulation', `New order injected for ${pick.name} (Token #${token})`, 'info');
  };

  // Step the most relevant order forward
  const handleAdvanceKitchenOrder = () => {
    const pendingOrder = orders.find(o => o.order_status === 'placed');
    const preparingOrder = orders.find(o => o.order_status === 'accepted' || o.order_status === 'preparing');
    const readyOrder = orders.find(o => o.order_status === 'ready');

    if (preparingOrder) {
      updateOrderStatus(preparingOrder.order_id, 'ready');
      addNotification('👨‍🍳 Kitchen Update', `Token #${preparingOrder.token_number} is now READY at ${preparingOrder.counter}!`, 'success');
    } else if (pendingOrder) {
      updateOrderStatus(pendingOrder.order_id, 'preparing');
      addNotification('👨‍🍳 Kitchen Update', `Kitchen started preparing Token #${pendingOrder.token_number}`, 'info');
    } else if (readyOrder) {
      updateOrderStatus(readyOrder.order_id, 'collected');
      addNotification('✅ Pickup Done', `Token #${readyOrder.token_number} collected. Ingredients auto-deducted!`, 'success');
    } else {
      addNotification('Demo Simulator', 'No active kitchen orders to advance. Try injecting an order!', 'warning');
    }
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 text-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
        
        {/* Left minimal indicator */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>Hackathon Tester</span>
          </span>
          <span className="text-slate-500 text-[10px] hidden sm:inline">•</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Simulate rush hours, inject test tokens & advance kitchen status
          </span>
        </div>

        {/* Toggle / Quick triggers */}
        <div className="flex items-center gap-2">
          {!isOpen ? (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 py-0.5 px-2 rounded-md hover:bg-indigo-500/10 transition-colors"
            >
              <span>Expand Controls</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 py-0.5 px-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              <span>Collapse</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Controls Tray */}
      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-900/90 py-2 px-4 sm:px-8 animate-in slide-in-from-top-1 duration-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">
              Simulation Triggers for Live Testing:
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Rush Hour Toggle */}
              <button
                onClick={() => {
                  const nextState = !isRushMode;
                  setIsRushMode(nextState);
                  addNotification(
                    nextState ? '🔥 Peak Rush Simulated' : '🟢 Normal Crowd Restored',
                    nextState ? 'Canteen load raised to 85+ students. AI recommending 1:45 PM slot.' : 'Canteen crowd returned to normal low volume.',
                    nextState ? 'warning' : 'info'
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-xs transition-all border ${
                  isRushMode
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${isRushMode ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{isRushMode ? '🔥 Rush Hour Active' : 'Simulate Rush Hour'}</span>
              </button>

              {/* Quick Inject Order */}
              <button
                onClick={handleInjectOrder}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 font-semibold text-xs transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Inject Test Order</span>
              </button>

              {/* Advance Kitchen Order */}
              <button
                onClick={handleAdvanceKitchenOrder}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold text-xs transition-all active:scale-95"
              >
                <FastForward className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step Kitchen Order</span>
              </button>

              {/* Reset Demo */}
              <button
                onClick={resetDemoState}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all text-xs"
                title="Reset demo records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
