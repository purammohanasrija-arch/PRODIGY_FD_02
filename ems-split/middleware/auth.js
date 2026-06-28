const jwt =
require("jsonwebtoken");

module.exports =
(req, res, next) => {

  const token =
  req.header("Authorization");

  if (!token)
    return res.status(401).json({
      message: "No Token"
    });

  try {

    const decoded =
    jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();

  } catch {

    res.status(401).json({
      message:
      "Invalid Token"
    });

  }

};