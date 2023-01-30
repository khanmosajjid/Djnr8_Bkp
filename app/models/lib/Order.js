const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
   order:{
       type:Array,
       default:[],
       require:true
   },
    sign: {
        type: Array,
        default: [],
        require: true
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    oPostedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Order', orderSchema);