import { useNavigate } from 'react-router-dom';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const continueToReset = () => {
    onClose();
    navigate('/forgot-password');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="forgot-password-title" className="text-2xl font-bold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          We will verify your university email with a secure six-digit code.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={continueToReset}
            className="rounded-xl bg-[#9B0038] px-5 py-3 font-semibold text-white hover:bg-[#7d002e] focus:outline-none focus:ring-2 focus:ring-[#9B0038] focus:ring-offset-2"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
