

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    company:{
        type:Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    role:{
        type: String,
        required: true
    },
    location:{
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    total_opening:{
        type: Number,
        required: true
    },
    drive:{
        type: String,
        enum:['on campus','off campus'],
        required: true
    },
    type:{
        type: String,
        enum:['internship','placement', 'internship and placement'],
        required: true
    },
    sector:{
        type: String,
        enum:['IT', 'Core', 'Management'],
        required: true
    },
    salary:{
        type:{
            min:{
                type:Number
            },
            max:{
                type:Number,
                required: true
            }
        }
    },
    criteria:{
        type:Schema.Types.ObjectId,
        ref: 'Criteria',
    },
    result:{
        type: Schema.Types.ObjectId,
        ref: 'OfferResult',
        required: true
    },
    skills:{
        type: [String],
        required: true
    }
}, {
  timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;