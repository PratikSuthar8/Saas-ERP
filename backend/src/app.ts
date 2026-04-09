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
import tenantRoutes from "./modules/tenant/tenant.routes";
import bomRoutes from "./modules/bom/bom.routes";

const app = express();

// CORS configuration - allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/test", testRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/bom", bomRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 ERP SaaS API Running");
});

export default app;
