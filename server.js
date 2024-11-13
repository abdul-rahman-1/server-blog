import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT;
const serv = process.env.SERV;
const baseUrl = `http://localhost:${port}`;

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

// New /api/sensor endpoint
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
  console.log(`Server Is Active and Connected to MongoDB And Fully Secured at ${baseUrl}`);
});
