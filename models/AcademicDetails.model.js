

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const academicDetailsSchema = new Schema({
    result: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicResult',
        required: true
    },
    applied: [
    {        
        type:{ 
            offer :{
            type: Schema.Types.ObjectId,
            ref: 'Offer',
            }   
        }
    }],
    selected: {
        type: {
            offer: {
                type: Schema.Types.ObjectId,
                ref: 'Offer'
            },
            salary:{
                type:Number
            }
        }

    },
    passout_year: {
        type: Number,
        required: true
    }
}, {
  timestamps: true
});

const AcademicDetails = mongoose.model('AcademicDetails', academicDetailsSchema);
module.exports = AcademicDetails;