import { validationResult } from "express-validator";
import Booking from "../Models/Booking.js";
import HttpError from "../middlewares/httpError.js";
import dotenv from "dotenv";
import Stripe from 'stripe';
import Message from "../Models/Message.js";

dotenv.config();
const stripe = new Stripe(process.env.Secret_key);

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

export const createBookingStripe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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

    // Step 1: Save a pending booking
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

    // Step 2: Create Stripe session
    if (payment_mode === "stripe") {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          customer_email: email,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Tour Booking',
                  description: `Booking for tour ${tourId}`,
                },
                unit_amount: total_cost * 100,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${req.headers.origin}/tours/bookings?status=success`,
          cancel_url: `${req.headers.origin}/payment-cancelled`,
          metadata: {
            bookingId: newBooking._id.toString(),
            userId,
            tourId,
            operatorId,
          },
        });

        return res.status(200).json({
          status: true,
          message: "Stripe session created and booking saved.",
          url: session.url,
        });
      } catch (stripeErr) {
        console.error("Stripe error:", stripeErr);
        return next(new HttpError("Stripe session creation failed", 500));
      }
    }
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

    const userBookings = await Booking.find({ user: userId, isDeleted: false }).populate('tour_operator').populate('tour_and_activity')
console.log(userBookings)
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
//stripe success
export const verifyStripeSession = async (req, res, next) => {
  const { session_id } = req.query;

  if (!session_id) {
    return next(new HttpError('Session ID is required', 400));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      // Optional: Save booking to DB if not already done in webhook
      return res.status(200).json({ status: 'success', session });
    } else {
      return res.status(400).json({ status: 'fail', message: 'Payment not successful' });
    }
  } catch (err) {
    console.error('Stripe verification error:', err);
    return next(new HttpError('Failed to verify session', 500));
  }
};


