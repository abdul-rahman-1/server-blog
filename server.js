import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

// Ensure ESM modules by adding "type": "module" in package.json,
// or rename file to .mjs

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3000;
const serv = process.env.SERV;
const baseUrl = `http://localhost:${port}`; // Use backticks for template literal

app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API!");
});

// /api/Store endpoint
app.get("/api/Store", async (req, res) => {
  const providedKey = req.headers["serv"];

  if (providedKey !== serv) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let client;
  try {
    const mongoUri = process.env.MONGODB_URL;
    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("Store");
    const blogs = await db.collection("Products").find({}).toArray();

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

// New /api/data endpoint
app.get("/api/data", async (req, res) => {
  const providedKey = req.headers["serv"];

  if (providedKey !== serv) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let client;
  try {
    const mongoUri = process.env.MONGODB_URL;
    client = new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db("Sensor");
    const sensorData = await db.collection("Data").find({}).toArray();

    res.json(sensorData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is active and connected at ${baseUrl}`);
});
