import express from "express";
import {
  createReview,
  getBookReviews,
  updateReview,
} from "../Controller/reviewController.js";
import { check } from "express-validator";
import authCheck from "../middlewares/authCheck.js";

const router = express.Router();

// router.post("/getAll", getBooks);

router.use(authCheck);

router.post(
  "/addReview",
  [
    check("review").not().isEmpty(),
    check("ratings").not().isEmpty(),
    check("tourId").not().isEmpty(),
  ],
  createReview
);

router.patch(
  "/updateReview",
  [check("reviewId").not().isEmpty()],
  updateReview
);
router.post(
  "/getBookReviews",
  [check("tourId").not().isEmpty()],
  getBookReviews
);
export default router;
