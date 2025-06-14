import express from "express";
import {
  createTour,
  getTours,
  getMyTours,
  updateTour,
  DeleteTour,
  getToursById,
  getToursFiltering,
  getTopRatedTours,
  getToursSearch,
  getBookedCountByTour,
} from "../Controller/tourController.js";
import {
  validateJSONField,
  itineraryValidator,
  coordinatesValidator,
} from "../middlewares/utils/validation.js";

import { check, body } from "express-validator";
import authCheck from "../middlewares/authCheck.js";

import createMultipleFileupload from "../middlewares/multer/createMultipleFileupload.js";
import { addItineraryToTour ,deleteItineraryTour,updateItineraryTour} from "../Controller/itineraryController.js";


const router = express.Router();
router.post("/getAllTours",getTours );
router.use(authCheck);

router.post(
  "/getMyTours",
  [check("operatorId").not().isEmpty()],
  getMyTours
);

router.post("/viewTour", [check("tourId").not().isEmpty()], getToursById);
router.patch(
  "/updateTour",
  createMultipleFileupload('cover_image'),
  [check("tourId").not().isEmpty()],
  body("coordinates").custom(validateJSONField("Coordinates", coordinatesValidator)),
  updateTour
);
router.patch(
  "/updateItinerary",
  [check("tourId").not().isEmpty()],
  [check("itineraryId").not().isEmpty()],
  updateItineraryTour
);
router.post(
  "/addTour",
  createMultipleFileupload('cover_image'),
  [
    check("title").notEmpty().withMessage("Title is required"),
    check("description").notEmpty().withMessage("Description is required"),
    check("activityTypes").notEmpty().withMessage("ActivityTypes is required"),
    check("duration").notEmpty().isNumeric().withMessage("Duration must be a number"),
    check("availability").notEmpty().isNumeric().withMessage("Availability must be a number"),
    check("destination").notEmpty().withMessage("Destination is required"),
  // ✅ Use reusable custom validators
    body("itinerary").custom(validateJSONField("Itinerary", itineraryValidator)),
    body("coordinates").custom(validateJSONField("Coordinates", coordinatesValidator)),
  ],
  createTour
);
router.post("/topRatedTour", getTopRatedTours);

router.patch("/delete", [check("tourId").not().isEmpty()], DeleteTour);
router.get("/searchTour", getToursSearch);
router.post("/addNew",[check("tourId").not().isEmpty()], body("itinerary").custom(validateJSONField("Itinerary", itineraryValidator)),addItineraryToTour)
router.patch('/deleteItinerary',[check("tourId").not().isEmpty()],deleteItineraryTour)
router.post("/booked-count", getBookedCountByTour);
router.post('/filter', getToursFiltering);
export default router;
