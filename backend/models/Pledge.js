// models/Pledge.js
const mongoose = require('mongoose');

const pledgeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true, // The pledge must have some text
      trim: true,     // Removes extra spaces
    },
    user: {
      type: String,
      required: true, // The name of the user who made the pledge
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Link to the user in your database
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Pledge', pledgeSchema);
