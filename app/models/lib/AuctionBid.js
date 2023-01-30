const mongoose = require('mongoose');

const auctionBidSchema = new mongoose.Schema({

    oBidder: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    oRecipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    eBidStatus: {
        type: String,
        enum: ['Bid', 'Canceled', 'Accepted', 'Sold', 'Rejected', 'Transfer']
    },
    nBidPrice: {
        type: mongoose.Types.Decimal128,
        required: true
    },
    oNFTId: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFT'
    },
    oNFTOwnersId: {
        type: mongoose.Schema.ObjectId,
        ref: 'NFTowners'
    },
    sCreated: {
        type: Date,
        default: Date.now
    },
    sTransactionHash: {
        type: String,
    },
    nQuantity: Number,
    sOrder:Array,
    sSignature:Array,
    nTokenID: Number
});

module.exports = mongoose.model('AuctionBid', auctionBidSchema);