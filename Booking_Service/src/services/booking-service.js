const {BookingRepository}= require('../repositories')
const {ServerConfig, Queue} = require('../config')
const axios= require('axios')
const db= require('../models')
const AppError = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')
const {Enums} = require('../utils/common')
const bookingRepo = new BookingRepository();

const {CANCELLED,PENDING,BOOKED, INITIATED}= Enums.Booking_status;



async function createBooking(data){
    const transaction = await db.sequelize.transaction();

    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`)
        const flightData = flight.data.data;
        if(data.noOfSeats>flightData.totalSeats){
            throw new AppError("Not enough seats available", StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data , totalCost: totalBillingAmount};
        const booking = await bookingRepo.create(bookingPayload,transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}/seats`,{
            seats: data.noOfSeats
        })

        await transaction.commit();
        return booking;


    } catch (error) {
        await transaction.rollback();
        throw error;
        
    }
    
}

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
 
    try {
        const bookingDetails = await bookingRepo.get(data.bookingId, transaction);
        if(bookingDetails.status== CANCELLED ){
            throw new AppError("The booking has expired ", StatusCodes.BAD_REQUEST);

        }
        console.log(bookingDetails);
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if (currentTime-bookingTime> 300000){
            await cancelBooking(data.bookingId);
            throw new AppError("The booking has expired", StatusCodes.BAD_REQUEST);
        } 

        if (bookingDetails.totalCost != data.totalCost){
            throw new AppError("The amount of the payment does not match", StatusCodes.BAD_REQUEST);

        }
        if(bookingDetails.userId != data.userId){
            throw new AppError("The user corresponding to the booking doesnot match", StatusCodes.BAD_REQUEST);

        }


        await bookingRepo.update(data.bookingId, {status: BOOKED}, transaction);
       
        Queue.sendData({
            recepientEmail: "fotavo6901@alientex.com",
            subject: "Flight Booked",
            text: `Booking successfully done for the booking ${data.bookingId}`
        });

        await transaction.commit();



    } catch (error) {
        await transaction.rollback();
        throw error;
        
    }


    
}



async function cancelBooking(bookingId) {
    const transaction = await db.sequelize.transaction();

    try {
        const bookingDetails = await bookingRepo.get(bookingId,transaction);
        console.log(bookingDetails);

        if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
        }

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${bookingDetails.flightId}/seats`,{
            availabeSeats: bookingDetails.noOfSeats,
            dec: 0
        });

        await bookingRepo.update(bookingId, {status: CANCELLED}, transaction);
        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        throw error;
        
    }
    
}

async function cancelOldBooking(params) {
    try {
        const time = new Date(Date.now()- 1000*300);
        const response = await bookingRepo.cancelOldBooking(time);

        return response;
    } catch (error) {
        console.log(error)
        
    }
    
}







module.exports={
    createBooking,
    makePayment,
    cancelOldBooking
    
}