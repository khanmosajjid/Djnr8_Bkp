const mongoose = require('mongoose');

const nftOwnerSchema = mongoose.Schema({
    nftId:{
        type: mongoose.Schema.ObjectId,
        ref: 'Nft'
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    oCurrentOwner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },

    sOrder:Array,
    sSignature:Array,
    nQuantity: Number,
    nQuantityLeft:Number,
    
    auctionQuantity:{
     type:Number,
     default:0
    },
    oPostedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    auctionPrice: mongoose.Types.Decimal128,
    nBasePrice: mongoose.Types.Decimal128,
    eAuctionType: {
        type: String,
        enum: ['Auction', 'Fixed Sale', 'Unlockable']
    },
    sTransactionStatus: {
        type: Number,
        default:-99,
        // -99: Transaction not submitted to Blockchain
        // -1:  Transaction Failed
        //  0:  Pending
        //  1:  Mined
        // -2:  deactivated by admin
        enum: [-99, -1, 0, 1,-2]
    },
    auction_end_date: {type :Date},
});

module.exports = mongoose.model('NFTowners', nftOwnerSchema);