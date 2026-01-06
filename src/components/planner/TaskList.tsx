import React, { useState } from 'react';
import { Plus, Check, Trash2, GripVertical } from 'lucide-react';
import { Task } from '@/types/planner';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  priority?: '80' | '60' | '20' | 'all';
  showAddForm?: boolean;
}

const priorityConfig = {
  '80': { label: '80% Priority', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  '60': { label: '60% Priority', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
  '20': { label: '20% Priority', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' }
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  priority = 'all',
  showAddForm = true
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'80' | '60' | '20'>(priority !== 'all' ? priority : '80');
  const [isAdding, setIsAdding] = useState(false);

  const filteredTasks = priority === 'all' 
    ? tasks 
    : tasks.filter(t => t.priority === priority);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onAddTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority
    });
    
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-3">
      {/* Task Items */}
      {filteredTasks.map(task => {
        const config = priorityConfig[task.priority];
        return (
          <div
            key={task.id}
            className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
              task.completed 
                ? 'bg-zinc-900/50 border-zinc-800 opacity-60' 
                : `${config.bg} ${config.border}`
            }`}
          >
            <button className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} className="text-zinc-600" />
            </button>
            
            <button
              onClick={() => onToggleTask(task.id)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                task.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-zinc-600 hover:border-zinc-400'
              }`}
            >
              {task.completed && <Check size={12} className="text-white" />}
            </button>
            
            <span className={`flex-1 ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
              {task.title}
            </span>
            
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${config.color} ${config.bg}`}>
              {task.priority}%
            </span>
            
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        );
      })}

      {/* Empty State */}
      {filteredTasks.length === 0 && !isAdding && (
        <div className="text-center py-8 text-zinc-500">
          <p className="text-sm">No tasks yet. Add one to get started.</p>
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <>
          {isAdding ? (
            <form onSubmit={handleAddTask} className="space-y-3 p-3 bg-zinc-900 rounded-lg border border-zinc-700">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Priority:</span>
                {(['80', '60', '20'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewTaskPriority(p)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      newTaskPriority === p 
                        ? `${priorityConfig[p].bg} ${priorityConfig[p].color} ${priorityConfig[p].border} border` 
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-medium py-2 rounded-lg transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:text-amber-400 hover:border-amber-500/50 transition-all"
            >
              <Plus size={18} />
              <span>Add Task</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
