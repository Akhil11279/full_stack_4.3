const express = require('express');
const app = express();
const routes = require('./routes/index');

app.use(express.json());

// Use API routes
app.use('/api', routes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ticket Booking API running at http://localhost:${port}`);
});
