const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    rollno: Number,
    name: String,
    "c-marks": Number,
    "python-marks": Number,
    "java-marks": Number,
    "total-marks": Number,  
    percentage: Number      
});

const Student = mongoose.model('Student', studentSchema,'students');
module.exports = Student;