import Swal from "sweetalert2";

interface ConfirmActionOptions {
  title: string;
  html: string;
  confirmButtonText: string;
  onConfirm: () => void;
  icon?: "warning" | "error" | "success" | "info" | "question";
}

export const showConfirmModal = ({ title, html, confirmButtonText, onConfirm, icon = "warning" }: ConfirmActionOptions) => {
  const isDarkMode = document.documentElement.classList.contains("dark");

  Swal.fire({
    title,
    html,
    icon,
    background: isDarkMode ? "#1e293b" : "#fff",
    color: isDarkMode ? "#fff" : "#111827",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: isDarkMode ? "#334155" : "#e2e8f0",
    confirmButtonText,
    cancelButtonText: "Hủy",
    focusCancel: true,
    customClass: {
      popup: "rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl",
      title: "text-xl font-bold text-gray-900 dark:text-white",
      confirmButton: "rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-red-600/20 text-sm",
      cancelButton:
        "rounded-xl px-6 py-2.5 font-medium bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white text-sm",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
