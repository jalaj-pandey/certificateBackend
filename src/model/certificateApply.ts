import mongoose from 'mongoose'

const certificateRequest  = new mongoose.Schema({
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    status:{
        type: String,
        enum: ['Applied','Accepted', 'Rejected'],
        default: 'Applied',
    },
    userEmail: {
        type: String,
    },
    userInfo: [{
        name: String,
        email: String,
        role: String,
        gender: String,
        batch: String,
        phoneNo: Date,
      }],
},
{
    timestamps: true,
  })

export const Apply = mongoose.model('certificateApply', certificateRequest);
