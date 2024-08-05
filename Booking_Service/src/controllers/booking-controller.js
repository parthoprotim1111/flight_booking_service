const { StatusCodes } = require('http-status-codes');
const {BookingService}= require('../services')

const {successRes,errorRes}= require('../utils/common')
const inMemDb= {};

async function createBooking(req,res){
    try {
        console.log(req.body);
        const response= await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
            
        });
        successRes.data=response;
        return res.status(StatusCodes.OK).json(successRes)
        
    } catch (error) {
        
        errorRes.error=error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorRes)
        
    }

}

async function makePayment(req,res) {
    try {
        const idempotencyKey = req.headers['x-idempotency-key'];
        if(!idempotencyKey){
            return res.status(StatusCodes.BAD_REQUEST).json({message:  'idempotency key missing'});

        }
        if(inMemDb[idempotencyKey]){
            return res.status(StatusCodes.BAD_REQUEST).json({message:'Cannot retry on a successful payment'});

        }

        const response = await BookingService.makePayment({
            totalCost: req.body.totalCost,
            userId: req.body.userId,
            bookingId: req.body.bookingId
        });
        inMemDb[idempotencyKey] = idempotencyKey;
        successRes.data = response;
        return res.status(StatusCodes.OK).json(successRes)
    } catch (error) {
        console.log(error);
        errorRes.error = error;
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorRes)
        
    }
    
}





module.exports={
    createBooking,
    makePayment
    
}