import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import testRoutes from "./modules/test/test.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import supplierRoutes from "./modules/supplier/supplier.routes";
import purchaseRoutes from "./modules/purchase/purchase.routes";
import salesRoutes from "./modules/sales/sales.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);  // Make sure this line exists
app.use("/api/test", testRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 ERP SaaS API Running");
});

export default app;
