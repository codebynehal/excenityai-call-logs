
import { toast } from "sonner";

export { toast };

// Legacy export that may still be used in some places
export const useToast = () => {
  return {
    toast,
    dismiss: () => {},
    toasts: []
  };
};
