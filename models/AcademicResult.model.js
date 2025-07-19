const academicResultSchema = new Schema({
    ssc:{
        type:{
            percentage: {
                type: Number,
                required: true
            },
            completion_year: {
                type: Number,
                required: true
            }
        }
    },
    hsc:{  
        type:{
            percentage: {
                type: Number,
            },
            completion_year: {
                type: Number,
            }
        }
    },
    diploma:{
        type:{
            result: {
                type:{
                    sem1: {
                        type: Number,
                    },
                    sem2: {
                        type: Number,
                    },
                    sem3: {
                        type: Number,
                    },
                    sem4: {
                        type: Number,
                    },
                    sem5: {
                        type: Number,
                    },
                    sem6: {
                        type: Number,
                    },
                    
            },
            completion_year: {
                type: Number,
            }
        }
    },
    degree: {
        type: {
            result: {
                type:{
                    sem1: {
                        type: Number,
                    },
                    sem2: {
                        type: Number,
                    },
                    sem3: {
                        type: Number,
                    },
                    sem4: {
                        type: Number,
                    },
                    sem5: {
                        type: Number,
                    },
                    sem6: {
                        type: Number,
                    },
                    sem7: {
                        type: Number,
                    },
                    sem8: {
                        type: Number,
                    }
                }
            }
            },
            completion_year: {
                type: Number,
            }
        }}
},{
    timestamps: true
});


const AcademicResult = mongoose.model('AcademicResult', academicResultSchema);
module.exports = AcademicResult;