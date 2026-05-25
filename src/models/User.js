const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
    },
    profileImage: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
        },
        message: "Please enter a valid URL for the profile image.",
      },
    },
  },
  { timestamps: true }
);

// ✅ Cascade delete: remove accommodations when user is deleted
userSchema.pre("findOneAndDelete", async function (next) {
  const userId = this.getQuery()._id;
  await mongoose.model("Accommodation").deleteMany({ userId });
  next();
});

module.exports = mongoose.model("User", userSchema);
