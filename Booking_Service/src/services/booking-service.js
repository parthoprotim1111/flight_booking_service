const {BookingRepository}= require('../repositories')
const {ServerConfig} = require('../config')
const axios= require('axios')
const db= require('../models')
const AppError = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')


async function createBooking(data){
    return new Promise((resolve,reject)=>{
        const result= db.sequelize.transaction(async function bookingImpl(tran){
            const flight= await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flight/${data.flightId}`);
            const flightData= flight.data.data;
            if(data.noOfSeats> flightData.availabeSeats){
               reject (new AppError('Not enought seats available', StatusCodes.BAD_REQUEST));
            }
            resolve(true);
        })

    })
    
}


module.exports={
    createBooking
    
}