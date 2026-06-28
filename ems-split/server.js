require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const Admin = require("./models/admin");
const Employee = require("./models/employee");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "All fields required" });
  const existing = await Admin.findOne({ username });
  if (existing) return res.status(400).json({ message: "Admin already exists" });
  const hashed = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, password: hashed });
  await admin.save();
  res.json({ message: "Admin registered" });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });
  const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, username: admin.username });
});

// --- Employee Routes ---
app.get("/api/employees", auth, async (req, res) => {
  const { search, department, page = 1, limit = 10 } = req.query;
  const query = {};
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { employeeId: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } }
  ];
  if (department) query.department = department;
  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query)
    .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
  res.json({ employees, total, pages: Math.ceil(total / limit) });
});

app.get("/api/employees/:id", auth, async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  res.json(emp);
});

app.post("/api/employees", auth, async (req, res) => {
  try {
    const emp = new Employee(req.body);
    await emp.save();
    res.status(201).json(emp);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put("/api/employees/:id", auth, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!emp) return res.status(404).json({ message: "Not found" });
    res.json(emp);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete("/api/employees/:id", auth, async (req, res) => {
  const emp = await Employee.findByIdAndDelete(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Employee deleted" });
});

app.get("/api/stats", auth, async (req, res) => {
  const total = await Employee.countDocuments();
  const byDept = await Employee.aggregate([{ $group: { _id: "$department", count: { $sum: 1 }, avgSalary: { $avg: "$salary" } } }]);
  const avgSalary = await Employee.aggregate([{ $group: { _id: null, avg: { $avg: "$salary" } } }]);
  res.json({ total, byDept, avgSalary: avgSalary[0]?.avg || 0 });
});

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
