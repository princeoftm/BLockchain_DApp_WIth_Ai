import React, { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";
import { useAppContext } from "../contexts/AppContext";
import toast from "react-hot-toast";

const Home = () => {
  const { web3, account, connectToMetaMask, connected, connecting } = useAppContext();
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState("idle");
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the smart contract
  const getTasks = async () => {
    if (!web3 || !account) return;

    try {
      setIsLoading("fetching");
      const taskContract = new web3.eth.Contract(
        [/* Contract ABI goes here */],
        "your_contract_address_here"
      );
      const fetchedTasks = await taskContract.methods.getMyTasks().call({ from: account });
      setTasks(fetchedTasks);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching tasks");
    } finally {
      setIsLoading("idle");
    }
  };

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    const taskText = inputRef.current?.value.trim();

    if (!taskText) {
      toast.error("Please enter a task");
      return;
    }

    if (!account) {
      toast.error("Connect to wallet first");
      return;
    }

    try {
      setIsLoading("adding");

      const taskContract = new web3.eth.Contract(
        [/* Contract ABI goes here */],
        "your_contract_address_here"
      );

      await taskContract.methods
        .addTask(taskText, false)
        .send({ from: account, gas: 3000000 })
        .on("receipt", () => {
          inputRef.current.value = "";
          getTasks();
          toast.success("Task added successfully");
        });
    } catch (error) {
      console.error(error);
      toast.error("Error adding task");
    } finally {
      setIsLoading("idle");
    }
  };

  // Delete (mark) a task
  const handleDeleteTask = async (taskId) => {
    if (!account) {
      toast.error("Connect to wallet first");
      return;
    }

    try {
      setIsLoading("deleting");

      const taskContract = new web3.eth.Contract(
        [/* Contract ABI goes here */],
        "your_contract_address_here"
      );

      await taskContract.methods
        .deleteTask(taskId, true)
        .send({ from: account, gas: 3000000 })
        .on("receipt", () => {
          getTasks();
          toast.success("Task deleted successfully");
        });
    } catch (error) {
      console.error(error);
      toast.error("Error deleting task");
    } finally {
      setIsLoading("idle");
    }
  };

  // Fetch tasks after connecting
  useEffect(() => {
    if (connected) {
      getTasks();
    }
  }, [connected]);

  return (
    <section className={styles.home}>
      <div className={styles.wallet}>
        {!connected ? (
          <button onClick={connectToMetaMask} disabled={connecting}>
            {connecting ? "Connecting..." : "Connect to MetaMask"}
          </button>
        ) : (
          <p>Connected as: {account}</p>
        )}
      </div>

      <div className={styles.tasks}>
        {isLoading === "fetching" ? (
          <p>Loading tasks...</p>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className={styles.task}>
              <p>
                Task: <span>{task.taskText}</span>
              </p>
              <button
                onClick={() => handleDeleteTask(task.id)}
                disabled={isLoading === "deleting"}
              >
                {isLoading === "deleting" ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))
        ) : (
          <p>No tasks found</p>
        )}
      </div>

      <div className={styles.form}>
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Enter new task"
            ref={inputRef}
            disabled={!connected || isLoading === "adding"}
          />
          <button
            type="submit"
            disabled={!connected || isLoading === "adding"}
          >
            {isLoading === "adding" ? "Adding..." : "Add Task"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Home;
