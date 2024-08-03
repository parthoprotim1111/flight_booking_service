const { StatusCodes } = require('http-status-codes');
const {BookingService}= require('../services')

const {successRes,errorRes}= require('../utils/common')


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
        console.log("Printing Error",error)
        errorRes.error=error;
        return res.status(error.StatusCodes).json(errorRes)
        
    }

}





module.exports={
    createBooking
    
}