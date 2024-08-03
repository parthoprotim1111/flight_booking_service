const express= require('express')
const router= express.Router()
const {bookingController}=require('../../controllers')


router.get('/',bookingController.createBooking)




module.exports=router;
