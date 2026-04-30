import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";
export function generateToken(user) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}
export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized: Missing token" });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: "Forbidden: Invalid token" });
        req.user = user;
        next();
    });
}
//# sourceMappingURL=auth.js.map