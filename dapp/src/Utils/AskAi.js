export async function askAiAboutTasks(tasks) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const endpoint = "https://api.openai.com/v1/chat/completions";
  
    const taskList = tasks.map((t, idx) => `${idx + 1}. ${t.taskText}`).join("\n");
  
    const prompt = `
  You are a smart task assistant.
  Given these tasks:
  ${taskList}
  
  1. Suggest the best order to complete them based on urgency and logic.
  2. For each task, assign one of these priority labels: "Urgent", "Normal", or "Low".
  3. Return a JSON array of objects. Each object must have:
      - "index" (the original task index starting from 0)
      - "priority" (the priority label)
  
  ONLY return the JSON. Example:
  
  [
    { "index": 2, "priority": "Urgent" },
    { "index": 0, "priority": "Normal" },
    { "index": 1, "priority": "Low" }
  ]
  `;
  
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });
  
    const data = await response.json();
    const aiText = data.choices[0].message.content.trim();
    const parsed = JSON.parse(aiText);
    return parsed;
  }
  