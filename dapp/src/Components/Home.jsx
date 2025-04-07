// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import toast from "react-hot-toast";

// Your contract ABI and address here
const CONTRACT_ABI = [ /* your ABI here */ ];
const CONTRACT_ADDRESS = "your_contract_address_here";

const Home = () => {
  const { web3, account, connectToMetaMask, connected, connecting } = useAppContext();
  const inputRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState("idle");

  const fetchTasks = async () => {
    if (!web3 || !account) {
      console.log("Web3 or account not ready yet");
      return;
    }

    try {
      setIsLoading("fetching");
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      const fetchedTasks = await contract.methods.getMyTasks().call({ from: account });
      setTasks(fetchedTasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setIsLoading("idle");
    }
  };

  const addTask = async (taskText) => {
    if (!web3 || !account) {
      toast.error("Connect your wallet first!");
      return false;
    }
    try {
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      await contract.methods.addTask(taskText, false).send({
        from: account,
        gas: 3000000,
      });
      toast.success("Task added successfully!");
      return true;
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    if (!web3 || !account) {
      toast.error("Connect your wallet first!");
      return;
    }
    try {
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      await contract.methods.deleteTask(taskId, true).send({
        from: account,
        gas: 3000000,
      });
      toast.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const value = inputRef.current.value.trim();
    if (!value) return;

    setIsLoading("adding");
    const success = await addTask(value);
    if (success) {
      inputRef.current.value = "";
      fetchTasks();
    }
    setIsLoading("idle");
  };

  useEffect(() => {
    if (connected) {
      fetchTasks();
    }
  }, [connected]);

  return (
    <section style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        {!connected ? (
          <button onClick={connectToMetaMask}>
            {connecting ? "Connecting..." : "Connect to MetaMask"}
          </button>
        ) : (
          <p>Connected: {account}</p>
        )}
      </div>

      <form onSubmit={handleAddTask} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter your task"
          ref={inputRef}
          style={{ marginRight: "1rem" }}
        />
        <button type="submit" disabled={isLoading === "adding"}>
          {isLoading === "adding" ? "Adding..." : "Add Task"}
        </button>
      </form>

      <div>
        {isLoading === "fetching" ? (
          <p>Loading tasks...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} style={{ marginBottom: "1rem" }}>
              <p>Task: {task.taskText}</p>
              <button
                onClick={() => deleteTask(task.id)}
                disabled={isLoading === "deleting"}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No tasks found</p>
        )}
      </div>
    </section>
  );
};

export default Home;
