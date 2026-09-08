const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
{
    userId:{
        type:String,
        required:true
    },

    fileName:{
        type:String,
        required:true
    },

    extractedText:{
        type:String
    },

    score:{
        type:Number
    },

    skills:[
        String
    ],

    missingSkills:[
        String
    ],

    suggestions:[
        String
    ],

    analysis:{
        type:String
    }

},
{timestamps:true}
);

module.exports = mongoose.model("Resume",resumeSchema);