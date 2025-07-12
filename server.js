import express from "express";
import askGemini from "./askGemini.js";

const app = express();
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "يرجى إرسال السؤال" });

  const answer = await askGemini(question);
  res.json({ answer });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("🚀 Server is running on port " + PORT);
});
