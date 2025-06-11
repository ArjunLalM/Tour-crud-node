import express from "express";
import { check,body } from "express-validator";
import authCheck from "../middlewares/authCheck.js";
import { createBooking, createBookingStripe , getMyToursBookings, getUserBookings, verifyAndUpdateTourBookingStatus, verifyStripeSession } from "../Controller/bookingController.js";

const router = express.Router();
router.use(authCheck);



router.post(
  '/addBooking',
  [
    check('tourId').notEmpty(),
    check('operatorId').notEmpty(),
    check('phone_number').notEmpty(),
    check('email').isEmail(),
    check('pickup_point').notEmpty(),
    check('date').notEmpty(),
    check('time').notEmpty(),
    check('no_of_persons').notEmpty(),
    check('total_cost').notEmpty(),
    check('payment_mode'),
  
  ],
  createBooking
);  

router.post(
  '/stripeSession',
  [
    check('tourId').notEmpty(),
    check('operatorId').notEmpty(),
    check('phone_number').notEmpty(),
    check('email').isEmail(),
    check('pickup_point').notEmpty(),
    check('date').notEmpty(),
    check('time').notEmpty(),
    check('no_of_persons').notEmpty(),
    check('total_cost').notEmpty(),
    check('payment_mode'),
  
  ],
  createBookingStripe
);  




router.post('/getMyBookingsOperator',[check('operatorId').notEmpty()],getMyToursBookings)

router.get('/getMyBookings',getUserBookings)
router.get('/verify-session', verifyStripeSession);
router.post('/verifyAndAcceptTourBooking',[check('bookingId').notEmpty()],verifyAndUpdateTourBookingStatus)

export default router;
