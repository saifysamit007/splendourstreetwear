import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export default function NotificationToast() {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-24 right-6 z-[400] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className={cn(
              "flex items-center gap-4 py-4 px-6 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px]",
              notification.type === 'success' 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : notification.type === 'error'
                  ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-500"
            )}>
              <div className="shrink-0">
                {notification.type === 'success' && <CheckCircle size={20} />}
                {notification.type === 'error' && <XCircle size={20} />}
                {notification.type === 'info' && <Info size={20} />}
              </div>
              
              <p className="text-xs font-black uppercase tracking-widest flex-grow">
                {notification.message}
              </p>

              <button 
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
