// Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { abi as taskAbi } from "../Utils/constant";
import { useAppContext } from "../contexts/AppContext";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = "0x4009f1897533df52CC825da24Cc5F2d423537ae3";

export default function Home() {
  const { web3, account, connectWallet, connected, connecting } = useAppContext();
  const inputRef = useRef();
  const [isLoading, setIsLoading] = useState("idle");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    if (!connected) return;
    setIsLoading("fetching");
    try {
      const taskContract = new web3.eth.Contract(taskAbi, CONTRACT_ADDRESS);
      const myTasks = await taskContract.methods.getMyTasks().call({ from: account });
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading("idle");
    }
  };

  const addTask = async (text) => {
    setIsLoading("adding");
    try {
      const taskContract = new web3.eth.Contract(taskAbi, CONTRACT_ADDRESS);
      await taskContract.methods.addTask(text, false).send({ from: account });
      toast.success("Task added!");
      return true;
    } catch {
      toast.error("Failed to add task");
      return false;
    } finally {
      setIsLoading("idle");
    }
  };

  const deleteTask = async (id) => {
    setIsLoading("deleting");
    try {
      const taskContract = new web3.eth.Contract(taskAbi, CONTRACT_ADDRESS);
      await taskContract.methods.deleteTask(id, true).send({ from: account });
      toast.success("Task deleted!");
      await fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsLoading("idle");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const val = inputRef.current.value.trim();
    if (!val) return;
    const ok = await addTask(val);
    if (ok) {
      inputRef.current.value = "";
      fetchTasks();
    }
  };

  useEffect(() => {
    if (connected) fetchTasks();
  }, [connected]);

  return (
    <div>
      {!connected ? (
        <button onClick={connectWallet} disabled={connecting}>
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <form onSubmit={handleAdd}>
        <input ref={inputRef} placeholder="Enter task" disabled={isLoading !== "idle"} />
        <button type="submit">Add</button>
      </form>

      {isLoading === "fetching" ? (
        <p>Loading...</p>
      ) : tasks.length ? (
        tasks.map((task) => (
          <div key={task.id}>
            <span>{task.taskText}</span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        ))
      ) : (
        <p>No tasks</p>
      )}
    </div>
  );
}
