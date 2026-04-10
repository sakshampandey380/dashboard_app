import { UserPlus, PackagePlus, PlusCircle } from "lucide-react";
import Button from "../common/button";

const QuickActions = ({ onAddUser, onAddProduct, onAddTask, isAdmin }) => (
  <div className="card p-5">
    <div className="mb-4">
      <h3 className="font-display text-xl font-semibold">Quick actions</h3>
      <p className="text-sm text-slate-500 dark:text-slate-300">
        Jump straight into your most common workflows.
      </p>
    </div>
    <div className="grid gap-3">
      {isAdmin ? (
        <Button className="justify-start" onClick={onAddUser}>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      ) : null}
      <Button variant="secondary" className="justify-start" onClick={onAddProduct}>
        <PackagePlus className="h-4 w-4" />
        Add Product
      </Button>
      <Button variant="secondary" className="justify-start" onClick={onAddTask}>
        <PlusCircle className="h-4 w-4" />
        Add Task
      </Button>
    </div>
  </div>
);

export default QuickActions;
