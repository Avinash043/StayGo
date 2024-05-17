const express = require("express");
const router= express.Router();
const Listing = require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controller/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing )
  );

 //New Route
router.get("/new", isLoggedIn , listingController.createNew);

router
    .route("/:id")
    .get( wrapAsync(listingController.showListing ))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
    .delete(isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editListing ));

router.get("/:id/payment",isLoggedIn,wrapAsync(listingController.paymentPage ));
router.post("/:id/payment/pay",isLoggedIn,wrapAsync(listingController.pay ));


module.exports = router;