import toast from "react-hot-toast";
export const showError   = (msg) => toast.error(msg,   { duration: 4000 });
export const showSuccess = (msg) => toast.success(msg, { duration: 4000 });
