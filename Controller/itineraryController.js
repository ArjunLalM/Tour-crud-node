import { validationResult } from "express-validator";
import Tour from "../Models/Tours.js";
import HttpError from "../middlewares/httpError.js";
const parseField = (field) => {
  try {
    return typeof field === "string" ? JSON.parse(field) : field;
  } catch (err) {
    return null;
  }
};

export const addItineraryToTour = async (req, res, next) => {
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

    const { tourId, itinerary } = req.body;
console.log(req.body,"checking for itinerary")
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return next(new HttpError("Tour not found", 404));
    }

    const userId = req.userData?.userId;
    if (tour.tour_operator.toString() !== userId) {
      return next(
        new HttpError(
          "Unauthorized access. You can only modify your own tours.",
          403
        )
      );
    }

    const parsedItinerary = parseField(itinerary);
    if (!parsedItinerary || !Array.isArray(parsedItinerary)) {
      return next(new HttpError("Invalid itinerary data", 422));
    }

    tour.itinerary.push(...parsedItinerary);

    await tour.save();

    res.status(200).json({
      status: true,
      message: "Itinerary added successfully!",
      data: tour,
    });
  } catch (err) {
    console.error("Error updating itinerary:", err);
    return next(new HttpError("Failed to add itinerary to tour.", 500));
  }
};

//Update ItineraryTour
export const updateItineraryTour = async (req, res, next) => {
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

    const { tourId, itineraryId, description } = req.body;
    const { userId, role } = req.userData;

    if (role !== "operator") {
      return res.status(403).json({
        status: false,
        message: "Access denied! Only operators can update tours.",
      });
    }

    const existingTour = await Tour.findById(tourId);
    if (!existingTour) {
      return next(new HttpError("Tour not found", 404));
    }

    const existingItinerary = existingTour.itinerary.id(itineraryId);
    if (!existingItinerary) {
      return next(new HttpError("no Itinerary on this tour not found", 404));
    }

    if (existingTour.tour_operator.toString() !== userId) {
      return next(
        new HttpError(
          "Unauthorized access. You can only update your own tours.",
          403
        )
      );
    }

    //Update the itinerary description
    if (description !== undefined) {
      existingItinerary.description = description;
    }

    //  Save the tour document
    await existingTour.save();

    res.status(200).json({
      status: true,
      message: "Itinerary updated successfully!",
      data: existingTour,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};

//remove itinerary
export const deleteItineraryTour = async (req, res, next) => {
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

    const { tourId } = req.body;
    const { userId, role } = req.userData;

    if (role !== "operator") {
      return res.status(403).json({
        status: false,
        message: "Access denied! Only operators can update tours.",
      });
    }

    const existingTour = await Tour.findById(tourId);
    if (!existingTour) {
      return next(new HttpError("Tour not found", 404));
    }

    if (existingTour.tour_operator.toString() !== userId) {
      return next(
        new HttpError(
          "Unauthorized access. You can only update your own tours.",
          403
        )
      );
    }

    // Delete last itinerary if exists
    const itineraryLength = existingTour.itinerary.length;
    if (itineraryLength === 0) {
      return next(new HttpError("No itinerary found to delete", 404));
    }

    // Remove the last itinerary by index
    const lastItineraryId = existingTour.itinerary[itineraryLength - 1]._id;
    existingTour.itinerary = existingTour.itinerary.filter(
      (item) => item._id.toString() !== lastItineraryId.toString()
    );
    await existingTour.save();

    await existingTour.save();

    res.status(200).json({
      status: true,
      message: "Last itinerary deleted successfully!",
      data: existingTour,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};
