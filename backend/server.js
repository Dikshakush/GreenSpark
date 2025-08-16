const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ Check for required environment variables
if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in .env");
}
if (!process.env.PORT) {
  throw new Error("❌ PORT is not defined in .env");
}

// Route imports
const taskRoutes = require('./routes/tasks.js');
const ecoActionRoutes = require('./routes/ecoActionRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const badgeRoutes = require('./routes/badgeRoutes.js');
const ecoTipsRoutes = require('./routes/ecoTipsRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');
const progressRoutes = require('./routes/progressRoutes');
const ecoJourneyRoutes = require('./routes/ecoJourneyRoutes.js');
const communityRoutes = require('./routes/communityRoutes.js');
const spinRoutes = require("./routes/spinRoutes");
const connectDB = require("./config/db");

// Error middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// ✅ Connect to DB first, then start server
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/actions', ecoActionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/ecotips', ecoTipsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ecojourney', ecoJourneyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/community', communityRoutes);
app.use("/api/spin", spinRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('GreenSpark API is running');
});

// ✅ Error handler (must be after routes)
app.use(errorHandler);

// Start server
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
