const Accommodation = require("../models/Accommodation");

exports.createAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.create(req.body);
    res.status(201).json(accommodation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find();
    res.json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (accommodation) {
      res.json(accommodation);
    } else {
      res.status(404).json({ message: "Accommodation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (accommodation) {
      res.json(accommodation);
    } else {
      res.status(404).json({ message: "Accommodation not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
    if (accommodation) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Accommodation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
