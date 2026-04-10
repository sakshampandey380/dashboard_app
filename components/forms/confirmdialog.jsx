import Button from "../common/button";
import Modal from "../common/modal";

const ConfirmDialog = ({
  isOpen,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  loading = false,
  onClose,
  onConfirm,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} className="w-full max-w-md">
    <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>
    <div className="mt-6 flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" loading={loading} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

export default ConfirmDialog;
