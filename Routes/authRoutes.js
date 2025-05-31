import express from "express";
import { login,operatorSignUp, userSignUp } from "../Controller/authController.js";
import { check } from "express-validator";

const router = express.Router();

router.post("/signup",[
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('dateOfBirth').not().isEmpty(),
    check('phoneNumber').not().isEmpty(),
    check('email').not().isEmpty(),
    check('gender').not().isEmpty(),
    check('password').not().isEmpty(),
    check('passwordConfirm').not().isEmpty(),
], userSignUp);


router.post("/operatorSignup",[
    check('tourAgencyName').not().isEmpty(),
    check('agencyLocation').not().isEmpty(),
    check('companyPhoneNumber').not().isEmpty(),
    check('companyEmailId').not().isEmpty(),
    check('password').not().isEmpty(),
    check('passwordConfirm').not().isEmpty(),
],operatorSignUp);

router.post("/login",[
    check('email').not().isEmpty(),
    check('password').not().isEmpty()
], login);
export default router;
