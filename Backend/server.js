const express = require("express");
const cors = require("cors");  // Import cors
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true, 
  exposedHeaders: ['X-Ratelimit-Limit', 'X-Ratelimit-Remaining', 'X-Ratelimit-Retry-After']
})); 
app.use(express.json());
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
