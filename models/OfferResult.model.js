

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerResultSchema = new Schema({
    round_date:{
        type: Date,
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }],
}, {
  timestamps: true
});

const OfferResult = mongoose.model('OfferResult', offerResultSchema);
module.exports = OfferResult;