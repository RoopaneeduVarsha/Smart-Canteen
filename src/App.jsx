import React, { useState, useEffect } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { Navbar } from './components/common/Navbar';
import { DemoSimulatorBar } from './components/common/DemoSimulatorBar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/student/CartDrawer';
import { SmartPickupModal } from './components/student/SmartPickupModal';
import { PaymentModal } from './components/student/PaymentModal';
import { OrderTrackingView } from './components/student/OrderTrackingView';
import { FeedbackModal } from './components/student/FeedbackModal';

function MainLayout() {
  const { currentRole, activeStudentOrder, orders } = useCanteen();

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);

  // Auto-sync injected order event
  useEffect(() => {
    const handleInjected = (e) => {
      // Injected order processed
    };
    window.addEventListener('smartbite_inject_order', handleInjected);
    return () => window.removeEventListener('smartbite_inject_order', handleInjected);
  }, []);

  // When payment succeeds, automatically open the Live Tracking modal for that order
  const handlePaymentSuccess = (newOrder) => {
    setTrackingOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">

      {/* 1. Top Hackathon Demo Control Bar */}
      <DemoSimulatorBar />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setTrackingOrder(activeStudentOrder || orders[0])}
      />

      {/* 3. Dynamic Portal View */}
      <main className="flex-1 pb-16">
        {(currentRole === 'student' || currentRole === 'faculty') && (
          <StudentDashboard
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSlotModal={() => setIsSlotModalOpen(true)}
            onOpenTracking={(order) => setTrackingOrder(order)}
            onOpenFeedback={(order) => setFeedbackOrder(order)}
          />
        )}

        {currentRole === 'staff' && (
          <StaffDashboard />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* 4. Global Modals */}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToSlot={() => setIsSlotModalOpen(true)}
      />

      {/* AI Smart Pickup Slot Selection Modal */}
      <SmartPickupModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        onProceedToPayment={() => setIsPaymentModalOpen(true)}
      />

      {/* Mock Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Live Order Tracking & Digital Token Modal */}
      <OrderTrackingView
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onOpenFeedback={(order) => {
          setTrackingOrder(null);
          setFeedbackOrder(order);
        }}
      />

      {/* Feedback & Rating Modal */}
      <FeedbackModal
        isOpen={!!feedbackOrder}
        order={feedbackOrder}
        onClose={() => setFeedbackOrder(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SmartBite AI • College Campus Canteen Management System</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Powered by AI Rush Prediction & Smart Pickup Scheduling</span>
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <CanteenProvider>
      <MainLayout />
    </CanteenProvider>
  );
}
