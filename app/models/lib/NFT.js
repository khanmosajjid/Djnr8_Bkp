const mongoose = require('mongoose');

const nftSchema = mongoose.Schema({
    sHash: {
        type: String,
        require: true
    },
    metaDataHash: {
        type: String,
        require: true
    },
    eType: {
        type: String,
    },
    
    sCreated: {
        type: Date,
        default: Date.now
    },
    oCurrentOwner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    oPostedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    sOrder:Array,
    sSignature:Array,
    sCollection: String,
    sName: String,
    sCollaborator: Array,
    sGenre: Array,
    sNftdescription: String,
    nCollaboratorPercentage: Array,
    sSetRroyalityPercentage: Number,
    nQuantity: Number,
   
    nView: Number,
    nBasePrice: mongoose.Types.Decimal128,
    eAuctionType: {
        type: String,
        enum: ['', 'Auction', 'Fixed Sale', 'Unlockable', 'Fixed Sale/Auction', 'Auction/Fixed Sale']
    },
    erc721:{
        type:Boolean,
        require:true,
        default:true
     },
    nTokenID: {
        type: Number,
        require:true
    },
    nQuantityOnSale: {
        type: Number,
        default:0
    },
    sTransactionHash: {
        type: String
    },
    hiddenContent: {
        type: String
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
    user_likes: [{
        type: mongoose.Schema.ObjectId
    }],
    oCollection: {
        type: mongoose.Schema.ObjectId,
        ref: 'Collection'
    },
    auction_end_date: {type :Date},
    sGenre: Array,
    sBpm: {
        type: Number
    },
    skey_equalTo: {
        type: String
    },
    skey_harmonicTo: {
        type: String
    },
    track_cover:{
        type: String
    },
});

module.exports = mongoose.model('NFT', nftSchema);