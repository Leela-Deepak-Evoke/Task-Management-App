import { useState } from "react";
import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";

const API =
  "https://8x2657bjb9.execute-api.eu-north-1.amazonaws.com/production/task";

export default function App() {
  const queryClient = useQueryClient();

  const emptyTask = {
    title: "",
    desc: "",
    status: "pending",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [task, setTask] = useState(emptyTask);
  const [editing, setEditing] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await axios.get(API);
      return res.data || [];
    },
  });

  const addTask = useMutation({
    mutationFn: async () => {
      return axios.post(API, {
        ...task,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      setTask(emptyTask);
    },
  });

  const updateTask = useMutation({
    mutationFn: async () => {
      return axios.patch(API, {
        id: editing.id,
        title: task.title,
        desc: task.desc,
        status: task.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditing(null);
      setTask(emptyTask);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id) => {
      return axios.delete(API, {
        data: {
          id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="container">

      <h1>Task Manager with AWS</h1>

      <div className="form">

        <input
          placeholder="Title"
          value={task.title}
          onChange={(e) =>
            setTask({ ...task, title: e.target.value })
          }
        />

        <textarea
          placeholder="Description"
          value={task.desc}
          onChange={(e) =>
            setTask({ ...task, desc: e.target.value })
          }
        />

        <select
          value={task.status}
          onChange={(e) =>
            setTask({ ...task, status: e.target.value })
          }
        >
          <option>pending</option>
          <option>inprogress</option>
          <option>completed</option>
        </select>

        {editing ? (
          <button onClick={() => updateTask.mutate()}>
            Update Task
          </button>
        ) : (
          <button onClick={() => addTask.mutate()}>
            <FaPlus />
            Add Task
          </button>
        )}

      </div>

      {isLoading && <h3>Loading...</h3>}

      {!isLoading && data.length === 0 && (
        <div className="empty">
          <FaCheckCircle size={70} />
          <h2>Add New Task</h2>
        </div>
      )}

      <div className="tasks">

        {data.map((item) => (
          <div className="card" key={item.id}>

            <h2>{item.title}</h2>

            <p>{item.desc}</p>

            <span className={`status ${item.status}`}>
              {item.status}
            </span>

            <small>
              Added: {formatDate(item.addedAt)}
            </small>

            <small>
              Updated: {formatDate(item.updatedAt)}
            </small>

            <div className="actions">

              <button
                onClick={() => {
                  setEditing(item);
                  setTask(item);
                }}
              >
                <FaEdit />
              </button>

              <button
                onClick={() => deleteTask.mutate(item.id)}
              >
                <FaTrash />
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}