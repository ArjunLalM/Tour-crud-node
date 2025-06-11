import Reviews from "../Models/reviews.js";
import { validationResult } from "express-validator";
import HttpError from "../middlewares/httpError.js";
import Tour from "../Models/Tours.js";
import Operator from "../Models/operator.js";

export const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }

    const { tourId, review, ratings } = req.body;
    const { role, userId } = req.userData;

    console.log(userId, "userId", role, "role");

    // Check if user has the correct role
    if (role !== "user") {
      return next(
        new HttpError("Access denied! Only user can create reviews.", 403)
      );
    }

    // Create new review in the database
    const newReview = await Reviews.create({
      review: review,
      ratings,
      user: userId,
      tour: tourId,
    });

    // Respond with success
    res.status(201).json({
      status: true,
      message: "Review added successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Review adding failed. Please contact the admin.",
        500
      )
    );
  }
};

//review updating
export const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }

    const { tourId, review, ratings, reviewId } = req.body;
    const { role, userId } = req.userData;

    console.log(userId, "userId", role, "role");
    console.log(req.body,"ppppppppp")

    // Check if user has the correct role
    if (role !== "user") {
      return next(
        new HttpError("Access denied! Only user can edit reviews.", 403)
      );
    }

    // Create new review in the database
    const newReview = await Reviews.findByIdAndUpdate(reviewId, {
      review: review,
      ratings,
      user: userId,
      tour: tourId,
    });

    // Respond with success
    res.status(201).json({
      status: true,
      message: "Review added successfully!",
      data: newReview,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Review adding failed. Please contact the admin.",
        500
      )
    );
  }
};

//GET BOOK REVIEWS
export const getBookReviews = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());
      return next(
        new HttpError(
          "Invalid data inputs passed, please check your data before retrying!",
          422
        )
      );
    }

    const { tourId } = req.body;
    const {userId} = req.userData; // Assuming this is user ID (tour operator)

    // Find the tour
    const tour = await Tour.findById(tourId);

    if (!tour) {
      return next(new HttpError("Tour not found.", 404));
    }

  

    // Get reviews for the tour
    const reviews = await Reviews.find({ tour: tourId }).populate("user");

    if (!reviews.length) {
      return next(new HttpError("No reviews found for this tour.", 404));
    }

    res.status(200).json({
      status: true,
      message: "Reviews retrieved successfully.",
      data: reviews,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Process failed, please contact the admin. Review retrieval failed.",
        500
      )
    );
  }
};


// GET ALL REVIEWS
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Reviews.find()
      .populate("user", "firstName") 
      .populate("tour", "title");     

    res.status(200).json({
      status: true,
      message: "All reviews fetched successfully.",
      data: reviews,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Could not fetch reviews. Please try again later.",
        500
      )
    );
  }
};
