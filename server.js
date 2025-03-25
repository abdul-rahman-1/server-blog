import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 5000;
const serv = process.env.SERV;
const baseUrl = `http://localhost:${port}`;

app.use(cors());

// --- Old Endpoints ---

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the Blog API!");
});

// /api/Store endpoint (returns products from the Store database)
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

// /api/data endpoint (returns sensor data from the Sensor database)
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

// --- New Certificate Verification Endpoint ---

app.get("/api/certificate", async (req, res) => {
  const certificate = req.query.number;
  if (!certificate) {
    return res.status(400).json({ error: "Certificate number is required" });
  }
  try {
    const apiUrl = `${process.env.NO_CODE_API_URL}?tabId=${process.env.NO_CODE_TAB_ID}&searchKey=${encodeURIComponent(
      process.env.NO_CODE_SEARCH_KEY
    )}&searchValue=${encodeURIComponent(certificate)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch certificate data" });
  }
});

// --- Static Files & SPA Fallback ---

// In ES modules, __dirname is not defined so we use fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "dist");

// Serve static files from the built frontend (after running `npm run build`)
app.use(express.static(distPath));

// Catch-all route for Single Page Application (excludes /api routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(
    `Server Is Active and Connected to MongoDB And Fully Secured at ${baseUrl}`
  );
});
