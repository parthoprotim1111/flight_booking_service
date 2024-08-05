const express= require('express')
const router= express.Router()
const {bookingController}=require('../../controllers')


router.post('/',bookingController.createBooking)


router.post('/payment',bookingController.makePayment)

module.exports=router;
