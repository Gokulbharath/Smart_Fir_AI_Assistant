import jwt from "jsonwebtoken";

export const login = (req, res) => {
  console.log("🔥 LOGIN BODY 🔥", req.body);

  const { email, password } = req.body;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  console.log("🔥 ENV VALUES 🔥", {
    ADMIN_EMAIL,
    ADMIN_PASSWORD
  });

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { userId: "admin", email, role: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ LOGIN SUCCESS");

    return res.json({
      success: true,
      token,
      user: { id: "admin", email, name: "Admin", role: "ADMIN" }
    });
  }

  console.log("❌ LOGIN FAILED");
  return res.status(401).json({ error: "Invalid credentials" });
};
