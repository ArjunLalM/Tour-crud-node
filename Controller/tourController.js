import { validationResult } from "express-validator";
import Tour from "../Models/Tours.js";
import HttpError from "../middlewares/httpError.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data and try again!",
          422
        )
      );
    }

    console.log("object")

const { userId: operatorId, role } = req.userData;


if (role !== 'operator') {
  return next(new HttpError("Invalid user", 404));
}

// Before using or validating these fields
const parseField = (field) => {
  try {
    return JSON.parse(field);
  } catch {
    return field;
  }
};


    const {
      title,
      description,
      price,
      activityTypes,
      duration,
      availability,
      destination,
      itinerary,
      coordinates,
      isDeleted = false,
    } = req.body;


    console.log(req.body,"bodyy")

const parsedCoordinates = parseField(coordinates);
const parsedItinerary = parseField(itinerary);

console.log(parsedCoordinates,"parsed coo")
console.log(parsedItinerary,"parsed ite")

    // Handle multiple image uploads from multer
    console.log(req.files, "******************************************");
    // const uploadedImages = req.files ? req.files.map((file) => file.path) : [];
    const files = req.files;
    const uploadedImage = [];

    files.forEach((file) => {
      const filePath = `${file.path}`;
      fs.rename(file.path, filePath, (err) => {
        if (err) {
          // Handle error appropriately and send an error response
          return res.status(500).json({ error: "Failed to store the file" });
        }
      });
      uploadedImage.push(filePath);
    });
    // const uploadedImage = []
    console.log("Uploaded Images:", uploadedImage);

    const newTour = await Tour.create({
      tour_operator: operatorId,
      title,
      price,
      description,
      activityTypes,
      duration,
      availability,
      destination,
      itinerary : parsedItinerary,
      coordinates : parsedCoordinates,
       isDeleted,
      images: uploadedImage,
    });

    res.status(201).json({
      status: true,
      message: "Tour created successfully!",
      data: newTour,
    });
  } catch (err) {
    console.error("Error creating tour:", err);
    return next(
      new HttpError(
        "Oops! Process failed. Tour creation failed.",
        500
      )
    );
  }
};
// Get Tours
export const getTours = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    const tours = await Tour.find({ isDeleted: false });

    if (!tours.length) {
      return res.status(404).json({
        status: false,
        message: "No Tours found",
        data: [],
      });
    }



    res.status(200).json({
      status: true,
      message: "Tours retrieved successfully",
      data: tours,
      totalTours: tours.length,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Failed to fetch tours, please contact admin.",
        500
      )
    );
  }
};// Get Tours by Operator ID
export const getMyTours = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    const { operatorId } = req.body;

    if (!operatorId) {
      return res.status(400).json({
        status: false,
        message: "Operator ID is required",
        data: [],
      });
    }

    // Use the correct field name from your Tour schema: 'tour_operator'
    const tours = await Tour.find({ tour_operator: operatorId });

    if (!tours.length) {
      return res.status(404).json({
        status: false,
        message: "No tours found for this operator",
        data: [],
      });
    }

    console.log(tours, "tours from API");

    res.status(200).json({
      status: true,
      message: "Tours retrieved successfully",
      data: tours,
      totalTours: tours.length,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Failed to fetch tours, please contact admin.",
        500
      )
    );
  }
};

//updated tour
export const updateTour = async (req, res, next) => {
  try {
    // OPTIONAL: remove if validation is not required
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError(
          "Invalid data inputs passed. Please check your data before retrying!",
          422
        )
      );
    }

    const {
      tourId,
      title,
      description,
      activityTypes,
      duration,
      availability,
      destination,
      coordinates,
    } = req.body;

    const { userId, role } = req.userData;
    console.log(req.userData)
    // Check role (you mentioned "only admins" in the logic, so enforcing it)
    if (role !== "operator") {
      return res.status(403).json({
        status: false,
        message: "Access denied! Only admins can update tours.",
      });
    }

    // Find the tour
    const existingTour = await Tour.findById(tourId);
    if (!existingTour) {
      return next(new HttpError("Tour not found", 404));
    }

    // Optional: Check if the user is the original operator
    if (existingTour.tour_operator.toString() !== userId) {
      return next(new HttpError("Unauthorized access. You can only update your own tours.", 403));
    }

    // Delete old images if they exist
    if (existingTour.images && existingTour.images.length > 0) {
      existingTour.images.forEach((imagePath) => {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${imagePath}`, err);
          } else {
            console.log(`Deleted old file: ${imagePath}`);
          }
        });
      });
    }

    // Handle uploaded images from multer
    const files = req.files;
    const uploadedImages = [];

    if (files && files.length > 0) {
      files.forEach((file) => {
        const filePath = `${file.path}`;
        fs.rename(file.path, filePath, (err) => {
          if (err) {
            console.error(`File storage error: ${filePath}`, err);
            return res.status(500).json({ error: "Failed to store the file" });
          }
        });
        uploadedImages.push(filePath);
      });
    }

    // Update tour
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      {
        title,
        description,
        activityTypes,
        duration,
        availability,
        destination,
        coordinates,
        images: uploadedImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: true,
      message: "Tour updated successfully...!",
      data: updatedTour,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};


//softDeleteBook By ID
export const DeleteTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { userId, role } = req.userData;
    console.log(userId, "userId", role, "role");
    if (role !== "operator") {
      return next(
        new HttpError("Access denied! Only operator can delete tours.", 403)
      );
    }

    const { tourId } = req.body;

    // Check if the book exists
    const tour = await Tour.findById({ _id: tourId });
    if (!tour) {
      return next(new HttpError("tour not found!", 404));
    }

     // Optional: Check if the user is the original operator
    if (tour.tour_operator.toString() !== userId) {
      return next(new HttpError("Unauthorized access. You can only delete your own tours.", 403));
    }

    // Update isDeleted to true
    tour.isDeleted = true;
    await tour.save();

    res.status(200).json({
      status: true,
      message: "tour deleted successfully (soft delete)!",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Failed to delete the tour!", 500));
  }
};