import { validationResult } from "express-validator";
import Booking from "../Models/Booking.js";
import HttpError from "../middlewares/httpError.js";

export const createBooking = async (req, res, next) => {
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

    const { userId, role } = req.userData;

    if (role !== "user") {
      return next(new HttpError("Unauthorized user role", 403));
    }

    const {
      tourId,
      operatorId,
      phone_number,
      email,
      pickup_point,
      special_requirements,
      date,
      time,
      no_of_persons,
      total_cost,
      payment_mode,
    } = req.body;

    // Create new booking document
    const newBooking = await Booking.create({
      user: userId,
      tour_operator: operatorId,
      tour_and_activity: tourId,
      phone_number,
      email,
      pickup_point,
      special_requirements,
      date,
      time,
      no_of_persons,
      total_cost,
      payment_mode,
      payment_status: false,
      status: "pending",
      isCancelled: null,
      isDeleted: false,
    });

    res.status(201).json({
      status: true,
      message: "Booking created successfully!",
      data: newBooking,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    return next(
      new HttpError("Oops! Process failed. Booking creation failed.", 500)
    );
  }
};

//user Bookings get
export const getUserBookings = async (req, res, next) => {
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
    const { userId, role } = req.userData;

    if (role !== "user") {
      return next(new HttpError("Unauthorized user role", 403));
    }

    const userBookings = await Booking.find({ user: userId, isDeleted: false });

    if (!userBookings || userBookings.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No bookings found for this user.",
        data: [],
      });
    }

    res.status(200).json({
      status: true,
      message: "User bookings fetched successfully!",
      data: userBookings,
    });
  } catch (err) {
    console.error("Error creating tour:", err);
    return next(
      new HttpError("Oops! Process failed. booking creation failed.", 500)
    );
  }
};

//get the operator tours bookings

export const getMyToursBookings = async (req, res, next) => {
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
    const { role, userId } = req.userData;
    if (role !== "operator") {
      return next(new HttpError("Unauthorized user role", 403));
    }

    if (!operatorId) {
      return res.status(400).json({
        status: false,
        message: "Operator ID is required",
        data: [],
      });
    }
    if (operatorId !== userId) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to view these bookings",
        data: [],
      });
    }

    const tours = await Booking.find({ tour_operator: operatorId });

    if (!tours.length) {
      return res.status(404).json({
        status: false,
        message: "No toursBooking found for this operator",
        data: [],
      });
    }

    console.log(tours, "tours from API");

    res.status(200).json({
      status: true,
      message: "Bookings retrieved successfully",
      data: tours,
      totalTours: tours.length,
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Failed to fetch tours Bookings, please contact admin.",
        500
      )
    );
  }
};


//verifyAndAcceptTourBooking


export const verifyAndUpdateTourBookingStatus = async (req, res, next) => {
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

    const { bookingId, action } = req.body;
    const { role, userId } = req.userData;

    if (role !== 'operator') {
      return next(new HttpError("Unauthorized user role", 403));
    }

    if (!bookingId || !action) {
      return res.status(400).json({
        status: false,
        message: "Both booking ID and action are required",
        data: null,
      });
    }

    const allowedActions = ['accept', 'reject'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        status: false,
        message: `Invalid action. Allowed actions: ${allowedActions.join(", ")}`,
        data: null,
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        status: false,
        message: "Booking not found",
        data: null,
      });
    }

    if (booking.tour_operator.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to modify this booking",
        data: null,
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: false,
        message: `This booking has already been ${booking.status}`,
        data: booking,
      });
    }

    booking.status = action === 'accept' ? 'accepted' : 'rejected';
    await booking.save();

    res.status(200).json({
      status: true,
      message: `Booking successfully ${booking.status}`,
      data: booking,
    });

  } catch (err) {
    console.error(err);
    return next(
      new HttpError(
        "Oops! Failed to update the booking status, please contact admin.",
        500
      )
    );
  }
};

