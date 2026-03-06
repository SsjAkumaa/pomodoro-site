import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export function DailyPlanningWidget() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', startTime: '', endTime: '' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTask = () => {
    if (newTask.title && newTask.startTime && newTask.endTime) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          ...newTask,
        },
      ]);
      setNewTask({ title: '', startTime: '', endTime: '' });
      setShowAddForm(false);
    }
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const getCurrentProgress = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const dayStart = 0;
    const dayEnd = 24 * 60;
    return ((now - dayStart) / (dayEnd - dayStart)) * 100;
  };

  const getTaskProgress = (task: Task) => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const [endHour, endMin] = task.endTime.split(':').map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    if (now < start) return 0;
    if (now > end) return 100;
    return ((now - start) / (end - start)) * 100;
  };

  const isTaskActive = (task: Task) => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [startHour, startMin] = task.startTime.split(':').map(Number);
    const [endHour, endMin] = task.endTime.split(':').map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    return now >= start && now <= end;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Current Day Progress */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm">Progression de la journée</span>
          <span className="text-white/70 text-xs">{getCurrentProgress().toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
            style={{ width: `${getCurrentProgress()}%` }}
          />
        </div>
        <div className="text-white/50 text-xs mt-2">
          {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {sortedTasks.map((task) => {
          const progress = getTaskProgress(task);
          const isActive = isTaskActive(task);

          return (
            <div
              key={task.id}
              className={`bg-white/5 rounded-lg p-3 border transition-all ${
                isActive ? 'border-white/30 bg-white/10' : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{task.title}</div>
                  <div className="text-white/50 text-xs flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    {task.startTime} - {task.endTime}
                  </div>
                </div>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-white/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/40 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-white/40 text-xs mt-1">
                {progress.toFixed(0)}% accompli
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Button/Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-all border border-white/10"
        >
          <Plus size={16} />
          Ajouter une tâche
        </button>
      ) : (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
          <input
            type="text"
            placeholder="Titre de la tâche"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/40 border border-white/20 focus:border-white/50 outline-none text-sm"
          />
          <div className="flex gap-2">
            <input
              type="time"
              value={newTask.startTime}
              onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none text-sm"
            />
            <input
              type="time"
              value={newTask.endTime}
              onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="flex-1 px-3 py-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-all text-sm"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTask({ title: '', startTime: '', endTime: '' });
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
