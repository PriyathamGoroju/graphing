import { useState } from 'react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, description, variant = 'default', duration = 3000 }) => {
    const id = Date.now();
    const newToast = { id, title, description, variant };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`p-3 border-l-4 rounded shadow-md bg-white ${
            variant === 'destructive' ? 'border-red-500' : 'border-blue-500'
          }`}
        >
          <strong>{title}</strong>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      ))}
    </div>
  );

  return { toast: addToast, ToastContainer };
};

export default useToast;
