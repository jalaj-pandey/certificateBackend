import mongoose from 'mongoose'

const AppliedCertificate  = new mongoose.Schema({
  
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    certificateFileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'certificates', 
      },
    userInfo: [{
        name: String,
        email: String,
        batch: String,
        phoneNo: Date,
      }],
},
{
    timestamps: true,
  })

export const Apply = mongoose.model('Appliedcertificates', AppliedCertificate);
