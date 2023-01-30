const {
    User,
    Bid,
    NFT,
    NFTowners,
    AuctionBid
} = require('../../../models');
const validators = require("./validators");
const mongoose = require('mongoose');
const controllers = {};

const nodemailer = require('../../../utils/lib/nodemailer');
controllers.create = async (req, res) => {
    console.log("Create Exe here",req);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body.eBidStatus) return res.reply(messages.not_found("Bod Status"));
        if (!req.body.oRecipient) return res.reply(messages.not_found("Recipient"));
        if (!req.body.oNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.nBidPrice) return res.reply(messages.not_found("Bid Price"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));
        if (!req.body.nQuantity) return res.reply(messages.not_found("Quantity"));
        if (!req.body.nTokenID) return res.reply(messages.not_found("Token ID"));

        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) return res.reply(messages.invalid("Transaction Hash"));
        if (!validators.isValidObjectID(req.body.oNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (isNaN(req.body.nQuantity) || req.body.nQuantity <= 0) return res.reply(messages.invalid("Quantity"));
        if (isNaN(req.body.nTokenID) || req.body.nTokenID <= 0) return res.reply(messages.invalid("Token ID"));

        
        console.log("buy api is called----->",req.body)
        
        let oNFT = await NFT.findById(req.body.oNFTId, (error) => {
            if (error) throw error;
        });
        log.green(oNFT);
        let nftOwner_table_id = req.body.nftOwner_id;
        if (!oNFT) return res.reply(messages.not_found('NFT'));

        if (oNFT.nQuantity < +req.body.nQuantity) return res.reply(messages.invalid("Quantity"));

        // TODO: check if this is required
        if (req.body.eBidStatus == "Sold" || req.body.eBidStatus == "Bid") {
            if (!req.body.oRecipient) return res.reply(messages.not_found("Recipient"));
            if (!validators.isValidObjectID(req.body.oRecipient)) return res.reply(messages.invalid("Recipient ID"));

            let oUser = await User.findById(req.body.oRecipient, (err, user) => {
                if (err) throw error;
                // if (!user) return res.reply(messages.not_found('User'));
            });
            if (!oUser) return res.reply(messages.not_found('OUser'));
        }

        // Check if the bidder has already placed bid earlier
        let aBids = await Bid.findOne({
            oBidder: req.userId,
            oNFTId: req.body.oNFTId,
            oRecipient:req.body.oRecipient, 
            eBidStatus: "Bid"
        });

        let erc721 = false;
        if(req.body.erc721){
            erc721 = true;
        }

        // If previous bid found
        if (aBids) {
            console.log("BiD Found Data");
            if (req.body.eBidStatus == "Bid") {
                console.log("in bid Data");
                
                AuctionBid.findOneAndUpdate({  
                    oNFTId:req.body.oNFTId,  
                    oBidder:req.userId,
                    oRecipient:req.body.oRecipient,  
                    eBidStatus:"Bid"  
                },  { eBidStatus:"Canceled" }, (err, cancelbid) => {
                    if(err){
                        return res.reply(messages.server_error());
                    }
                    if(cancelbid){
                        Bid.findOneAndUpdate({ oBidder: req.userId,  oRecipient:req.body.oRecipient,  oNFTId: req.body.oNFTId, eBidStatus: "Bid" },{ eBidStatus:"Canceled" }, (err, bid) => { });
                        let oRecipientID = req.body.oRecipient;
                        const bid = new Bid({
                            oBidder: req.userId,
                            oRecipient: req.body.oRecipient,
                            eBidStatus: req.body.eBidStatus,
                            oNFTId: req.body.oNFTId,
                            nBidPrice: req.body.nBidPrice,
                            sTransactionHash: req.body.sTransactionHash,
                            nQuantity: req.body.nQuantity,
                            sOrder:req.body.sOrder,
                            sSignature:req.body.sSignature,
                            nTokenID: req.body.nTokenID
                        });
                        console.log("Bids Data"+ bid);
                        bid.save()
                        .then(async (result) => {
                            
                            console.log(" Inside bid Calleddd");
                            const auctionbid = new AuctionBid({
                                oBidder: req.userId,
                                oRecipient: req.body.oRecipient,
                                eBidStatus: req.body.eBidStatus,
                                oNFTId: req.body.oNFTId,
                                oNFTOwnersId: nftOwner_table_id,
                                nBidPrice: req.body.nBidPrice,
                                sTransactionHash: req.body.sTransactionHash,
                                nQuantity: req.body.nQuantity,
                                sOrder:req.body.buyerOrder,
                                sSignature:req.body.buyerSignature,
                                nTokenID: req.body.nTokenID
                            });
                            console.log("Auction BID Insert Data  " + JSON.stringify(auctionbid));
                            auctionbid.save().then(async (biderr, bidresult) => { 
                                if(biderr){
                                    console.log("bid Error  " + biderr);
                                }else{
                                    console.log("bid Inserted" + bidresult);
                                }
                            });
                            if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {
                                nodemailer.send('Bid_Place.html', {
                                    SITE_NAME: 'Djenerates',
                                    USERNAME: req.body.sOwnerEmail,
                                    ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,
                                    TEXT: 'Someone Placed Bid on your NFT.'
                                }, {
                                    from: process.env.SMTP_USERNAME,
                                    to: req.body.sOwnerEmail,
                                    subject: 'Bid Place'
                                })
                            }
                            return res.reply(messages.successfully((req.body.eBidStatus == "Sold") ? "Bought" : (req.body.eBidStatus == "Transfer") ? "Transferred" : 'Bid Placed'), result);
                        })
                        .catch((error) => {
                            return res.reply(messages.server_error());
                        });
                    }
                });
            }

            if (req.body.eBidStatus == "Sold") {
                AuctionBid.findOneAndUpdate({  
                    oNFTId:req.body.oNFTId,  
                    oBidder:req.userId,
                    oRecipient:req.body.oRecipient,  
                    eBidStatus:"Bid"  
                },  { eBidStatus:"Canceled" }, (err, cancelbid) => {
                    Bid.findOneAndUpdate({ oBidder: req.userId,  oRecipient:req.body.oRecipient,  oNFTId: req.body.oNFTId, eBidStatus: "Bid" },{ eBidStatus:"Canceled" }, (err, bid) => { });



                    const bid = new Bid({
                        oBidder: req.userId,
                        oRecipient: (req.body.eBidStatus == "Transfer") ? oRecipientID : req.body.oRecipient,
                        eBidStatus: req.body.eBidStatus,
                        oNFTId: req.body.oNFTId,
                        nBidPrice: req.body.nBidPrice,
                        sTransactionHash: req.body.sTransactionHash,
                        nQuantity: req.body.nQuantity,
                        sOrder:req.body.sOrder,
                        sSignature:req.body.sSignature,
                        nTokenID: req.body.nTokenID
                    });
                    console.log("Bids Data"+ bid);
                    bid.save()
                        .then(async (result) => {
                            console.log("Calleddd");
                            console.log("Status" + req.body.eBidStatus);                    
                            if (req.body.eBidStatus == "Sold" || req.body.eBidStatus == "Transfer") {
                                console.log(" Inside S/Transfer Calleddd");
                                let oNFTOfNewOwner = await NFT.findOne({
                                    oCurrentOwner: (req.body.eBidStatus == "Sold") ? req.userId : oRecipientID,
                                    nTokenID: oNFT.nTokenID
                                }).catch((error) => {
                                    throw error;
                                });
                                if(erc721){
                                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                                        sTransactionStatus: -99,
                                        oCurrentOwner: mongoose.Types.ObjectId(req.userId)
                                    }).catch((error) => {
                                        throw error;
                                    });
        
                                    await NFTowners.findByIdAndUpdate(req.body.nftOwner_id, {
                                        sTransactionStatus: -99,
                                        eAuctionType: "Unlockable",
                                      
                                        oCurrentOwner: mongoose.Types.ObjectId(req.userId)
                                    }).catch((error) => {
                                        throw error;
                                    });
                                }else{

                                    let updateQty = parseInt(req.body.nQuantity);
                                   

                                     //Mosajjid Changes In NFT Table for Quantity on Sale

                                    

                                     //---------------------------//
                                   
                                    let updateQty2 = -updateQty;
        
                                    let db_nftId = mongoose.Types.ObjectId(req.body.oNFTId);
                                    let db_oCurrentOwner = mongoose.Types.ObjectId(req.userId);
                                    let db_oRecipientID = mongoose.Types.ObjectId(req.body.oRecipient);
                                    nftOwner = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner });
                                    if (!nftOwner) {
                                        const nftOwner = new NFTowners({
                                            nftId: req.body.oNFTId,
                                            eType: req.body.eType,
                                            nQuantity: req.body.nQuantity,
                                            eAuctionType: "Unlockable",
                                            nBasePrice: req.body.nBidPrice,
                                            oPostedBy:oNft.oPostedBy,
                                            oCurrentOwner: req.userId,
                                            sTransactionStatus:-99,
                                            nQuantityLeft:req.body.nQuantity
                                        });
                                        nftOwner.save();
                                    }else{

                                        /********************************** Check If NFT is on Marketplace Start ****************************************/
                                        try{
                                            let nftOldData = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oRecipientID, sTransactionStatus: 1 });
                                            console.log("nftOldData " + nftOldData);
                                            nftOldData = nftOldData.toObject();
                                            console.log("left qty is " + nftOldData.nQuantityLeft);
                                            if(nftOldData.nQuantityLeft <= 0){
                                               
                                                NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty } }, {new: true },function(err, response) { });
                                            }else{
                                                
                                                NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty, nQuantityLeft:updateQty } }, {new: true },function(err, response) { });
                                            }

                                        }catch(e){ console.log("Error 1" + e); }
                                        /********************************** Check If NFT is on Marketplace Ends ****************************************/


                                        /********************************** Check If NFT is not on Marketplace Start ****************************************/
                                        try{
                                            let nftOldData = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oRecipientID, sTransactionStatus: -99 });
                                            console.log("nftOldData " + nftOldData);
                                            nftOldData = nftOldData.toObject();
                                            console.log("left qty is " + nftOldData.nQuantityLeft);
                                            if(nftOldData.nQuantityLeft <= 0){
                                                console.log("left qty 0");
                                                NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: updateQty, nQuantityLeft:updateQty }, eAuctionType: "Fixed Sale", nBasePrice: req.body.nBidPrice  }, {new: true },function(err, response) { });
                                            }else{
                                                console.log("left qty 0");
                                                NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: updateQty,nQuantityLeft:updateQty }, eAuctionType: "Fixed Sale", nBasePrice: req.body.nBidPrice }, {new: true },function(err, response) { });
                                            }

                                        }catch(e){ console.log("Error 1" + e); }
                                        /********************************** Check If NFT is not on Marketplace Start ****************************************/
                                        /*
                                        NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: updateQty,nQuantityLeft:updateQty } }, {new: true },function(err, response) { });
                                        */
                                    }

                                    NFTowners.findByIdAndUpdate(nftOwner_table_id, { $inc: { nQuantity: updateQty2 } }, {new: true },function(err, response) {});
                                }
                                if (req.body.nQuantity == oNFT.nQuantity) {
                                    
                                } else if (req.body.nQuantity < oNFT.nQuantity) {
                                    
                                } else {
                                    return res.reply(messages.bad_request("Invalid Quantity"));
                                }
                            }
                            if (req.body.eBidStatus == "Bid") {
                                console.log(" Inside bid Calleddd");
                                const auctionbid = new AuctionBid({
                                    oBidder: req.userId,
                                    oRecipient: req.body.oRecipient,
                                    eBidStatus: req.body.eBidStatus,
                                    oNFTId: req.body.oNFTId,
                                    oNFTOwnersId: nftOwner_table_id,
                                    nBidPrice: req.body.nBidPrice,
                                    sTransactionHash: req.body.sTransactionHash,
                                    nQuantity: req.body.nQuantity,
                                    sOrder:req.body.buyerOrder,
                                    sSignature:req.body.buyerSignature,
                                    nTokenID: req.body.nTokenID
                                });
                                console.log("Auction BID Insert Data  " + JSON.stringify(auctionbid));
                                auctionbid.save().then(async (biderr, bidresult) => { 
                                    if(biderr){
                                        console.log("bid Error " + biderr);
                                    }else{
                                        console.log("bid Inserted" + bidresult);
                                    }
                                });
        
                                if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {
                                    nodemailer.send('Bid_Place.html', {
                                        SITE_NAME: 'Djenerates',
                                        USERNAME: req.body.sOwnerEmail,
                                        ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,// `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                                        TEXT: 'Someone Placed Bid on your NFT.'
                                    }, { oPostedBy:oNft.oPostedBy,
                                    })
                                }
        
                            }
                            return res.reply(messages.successfully((req.body.eBidStatus == "Sold") ? "Bought" : (req.body.eBidStatus == "Transfer") ? "Transferred" : 'Bid Placed'), result);
                        })
                        .catch((error) => {
                            return res.reply(messages.server_error());
                        });
                        

                })

            }
            // if (req.body.nQuantity == aBids.nQuantity && req.body.nBidPrice < aBids.nBidPrice.toString())
            //     return res.reply(messages.bad_request("You already have a Bid with higher amount for same quantity!"));
            // else if (req.body.nQuantity == aBids.nQuantity && req.body.nBidPrice == aBids.nBidPrice.toString())
            //     return res.reply(messages.bad_request("You already have a Bid with the same quantity and Price"));

            // // Update The bid
            // Bid.findOneAndUpdate({
            //     oBidder: req.userId,
            //     oNFTId: req.body.oNFTId,
            //     eBidStatus: "Bid"
            // }, {
            //     nBidPrice: req.body.nBidPrice,
            //     sTransactionHash: req.body.sTransactionHash,
            //     nQuantity: req.body.nQuantity
            // }, (err, bid) => {

            //     if (req.body.eBidStatus == "Bid" && req.body.sOwnerEmail != '') {

            //         if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {

            //             nodemailer.send('Bid_Place.html', {
            //                 SITE_NAME: 'Djenerates',
            //                 USERNAME: req.body.sOwnerEmail,
            //                 ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`, //`${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
            //                 TEXT: 'Someone Placed Bid on your NFT.'
            //             }, {
            //                 from: process.env.SMTP_USERNAME,
            //                 to: req.body.sOwnerEmail,
            //                 subject: 'Bid Place'
            //             });
            //         }
            //     }

            //     if (err) return res.reply(messages.server_error());
            //     return res.reply(messages.successfully("Bid Placed"));
            // });


        } else {
            console.log("Exe here");
            let oRecipientID;
            if (req.body.eBidStatus == "Transfer") {
                let aUsers = await User.find({
                    sWalletAddress: req.body.oRecipient
                }, (error) => {
                    if (error) return res.reply(messages.server_error());
                });
                if (!aUsers.length) return res.reply(messages.bad_request("No Collaborator With Such Address is Registered!"));
                log.green(aUsers[0]);
                oRecipientID = aUsers[0]._id;
            }
            const bid = new Bid({
                oBidder: req.userId,
                oRecipient: (req.body.eBidStatus == "Transfer") ? oRecipientID : req.body.oRecipient,
                eBidStatus: req.body.eBidStatus,
                oNFTId: req.body.oNFTId,
                nBidPrice: req.body.nBidPrice,
                sTransactionHash: req.body.sTransactionHash,
                nQuantity: req.body.nQuantity,
                sOrder:req.body.sOrder,
                sSignature:req.body.sSignature,
                nTokenID: req.body.nTokenID
            });
            console.log("Bids Data"+ bid);
            bid.save()
                .then(async (result) => {
                    console.log("Calleddd");
                    console.log("Status" + req.body.eBidStatus);                    
                    if (req.body.eBidStatus == "Sold" || req.body.eBidStatus == "Transfer") {
                        console.log(" Inside S/Transfer Calleddd");
                        let oNFTOfNewOwner = await NFT.findOne({
                            oCurrentOwner: (req.body.eBidStatus == "Sold") ? req.userId : oRecipientID,
                            nTokenID: oNFT.nTokenID
                        }).catch((error) => {
                            throw error;
                        });
                        if(erc721){
                            await NFT.findByIdAndUpdate(req.body.oNFTId, {
                                sTransactionStatus: -99,
                                oCurrentOwner: mongoose.Types.ObjectId(req.userId)
                            }).catch((error) => {
                                throw error;
                            });

                            await NFTowners.findByIdAndUpdate(req.body.nftOwner_id, {
                                sTransactionStatus: -99,
                                nQuantityLeft:1,
                                oCurrentOwner: mongoose.Types.ObjectId(req.userId)
                            }).catch((error) => {
                                throw error;
                            });
                        }else{
                            let updateQty = parseInt(req.body.nQuantity);
                            
                            //Mosajjid changes for Qunatity on sale
                            await NFT.findByIdAndUpdate(req.body.oNFTId, { $inc: { nQuantityOnSale:-updateQty} }).catch((error) => {
                                throw error;
                            });


        
                          //------------------------------------------------------//

                            let updateQty2 = -updateQty;

                            let db_nftId = mongoose.Types.ObjectId(req.body.oNFTId);
                            let db_oCurrentOwner = mongoose.Types.ObjectId(req.userId);
                            let db_oRecipientID = mongoose.Types.ObjectId(req.body.oRecipient);


                            nftOwner = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner });
                            if (!nftOwner) {
                                console.log("e auction type is-->",req.body)
                                const nftOwner = new NFTowners({
                                    nftId: req.body.oNFTId,
                                    eType: req.body.eType,
                                    nQuantity: req.body.nQuantity,
                                    eAuctionType: "Fixed Sale",
                                    oPostedBy:oNft.oPostedBy,
                                    nBasePrice: req.body.nBidPrice,  
                                    oCurrentOwner: req.userId,
                                    sTransactionStatus:-99,
                                    nQuantityLeft:req.body.nQuantity
                                });
                                nftOwner.save();
                            }else{
                                NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: updateQty,nQuantityLeft:updateQty } }, {new: true },function(err, response) { });
                            }
                            NFTowners.findByIdAndUpdate(nftOwner_table_id, { $inc: { nQuantity: updateQty2 } }, {new: true },function(err, response) {});
                        }
                    }
                    if (req.body.eBidStatus == "Bid") {
                        console.log(" Inside bid Calleddd");
                        const auctionbid = new AuctionBid({
                            oBidder: req.userId,
                            oRecipient: req.body.oRecipient,
                            eBidStatus: req.body.eBidStatus,
                            oNFTId: req.body.oNFTId,
                            oNFTOwnersId: nftOwner_table_id,
                            nBidPrice: req.body.nBidPrice,
                            sTransactionHash: req.body.sTransactionHash,
                            nQuantity: req.body.nQuantity,
                            sOrder:req.body.buyerOrder,
                            sSignature:req.body.buyerSignature,
                            nTokenID: req.body.nTokenID
                        });
                        console.log("Auction BID Insert Data  " + JSON.stringify(auctionbid));
                        auctionbid.save().then(async (biderr, bidresult) => { 
                            if(biderr){
                                console.log("bid Error " + biderr);
                            }else{
                                console.log("bid Inserted" + bidresult);
                            }
                        });

                        if (req.body.sOwnerEmail && req.body.sOwnerEmail != undefined && req.body.sOwnerEmail != '' && req.body.sOwnerEmail != '-') {
                            nodemailer.send('Bid_Place.html', {
                                SITE_NAME: 'Djenerates',
                                USERNAME: req.body.sOwnerEmail,
                                ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,// `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                                TEXT: 'Someone Placed Bid on your NFT.'
                            }, {
                                from: process.env.SMTP_USERNAME,
                                to: req.body.sOwnerEmail,
                                subject: 'Bid Place'
                            })
                        }

                    }
                    return res.reply(messages.successfully((req.body.eBidStatus == "Sold") ? "Bought" : (req.body.eBidStatus == "Transfer") ? "Transferred" : 'Bid Placed'),result);
                })
                .catch((error) => {
                    return res.reply(messages.server_error());
                });
        }
    } catch (error) {
        console.log("Error is "+error)
        return res.reply(messages.server_error());
    }
};


//Transfer API
controllers.transfer = async (req, res) => {
    console.log("Transfer Exe here",req.body);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body.eBidStatus) return res.reply(messages.not_found("Bod Status"));
        if (!req.body.oRecipientWalletAddress) return res.reply(messages.not_found("Recipient"));
        if (!req.body.oNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.nBidPrice) return res.reply(messages.not_found("Bid Price"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));
        if (!req.body.nQuantity) return res.reply(messages.not_found("Quantity"));
        if (!req.body.nTokenID) return res.reply(messages.not_found("Token ID"));

        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) return res.reply(messages.invalid("Transaction Hash"));
        if (!validators.isValidObjectID(req.body.oNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (isNaN(req.body.nQuantity) || req.body.nQuantity <= 0) return res.reply(messages.invalid("Quantity"));
        if (isNaN(req.body.nTokenID) || req.body.nTokenID <= 0) return res.reply(messages.invalid("Token ID"));

        // let oNFT = await NFT.findById(req.body.oNFTId, (error) => {
        //     if (error) throw error;
        // });
        // log.green(oNFT);
        // let nftOwner_table_id = req.body.nftOwner_id;
        // if (!oNFT) return res.reply(messages.not_found('NFT'));

        // if (oNFT.nQuantity < +req.body.nQuantity) return res.reply(messages.invalid("Quantity"));

        // TODO: check if this is required
       
        // Check if the bidder has already placed bid earlier
        

        let erc721 = false;
        if(req.body.erc721){
            erc721 = true;
        }

        if (req.body.eBidStatus == "Transfer") {
            console.log("in transfer if loop")
            let aUsers = await User.find({
                sWalletAddress: req.body.oRecipientWalletAddress
            }, (error) => {
                if (error) return res.reply(messages.server_error());
            });
            console.log("user in transfer is----->",aUsers);
            if (!aUsers.length){
                if(erc721){
                    //Delete NFT if user is not registered in our marketplace for 721
                    NFT.findByIdAndDelete(req.body.oNFTId, function (err, docs) {
                        if (err){
                            console.log(err)
                        }
                        else{
                            console.log("Deleted : ", docs);
                        }
                    });
                   
                    NFTowners.findOneAndDelete({nftId:req.body.oNFTId}, function (err, docs) {
                        if (err){
                            console.log(err)
                        }
                        else{
                            console.log("Deleted User : ", docs);
                        }
                    });
                }else{
                     //Decrease NFT if user is not registered in our marketplace for 1155
                     
                     NFT.findByIdAndUpdate(req.body.oNFTId,{ $inc: { nQuantity: -req.body.nQuantity} }, 
                        {new: true },function(err, response) { 
                            if (err){
                                console.log(err)
                            }
                            else{
                                console.log("Deleted User : ", docs);
                            }
                            })
                   
                            NFTowners.findOneAndUpdate({ nftId:req.body.oNFTId}, { $inc: { nQuantity: -req.body.nQuantity,nQuantityLeft:-req.body.nQuantity } }, 
                        {new: true },function(err, response) { 
                            if (err){
                                console.log(err)
                            }
                            else{
                                console.log("Deleted User : ", docs);
                            }
                    });
                }
                
                return res.reply(messages.successfully("No User With Such Address is Registered!"));
            } 
            log.green(aUsers[0]);
            oRecipientID = aUsers[0]._id;

            let db_nftId = mongoose.Types.ObjectId(req.body.oNFTId);
            let db_oCurrentOwner = mongoose.Types.ObjectId(req.userId);
           

            if(erc721){

            


                NFT.findByIdAndUpdate(req.body.oNFTId,{oCurrentOwner:oRecipientID})
                NFTowners.findOneAndUpdate({ nftId:req.body.oNFTId}, 
                    { oCurrentOwner:oRecipientID,sTransactionStatus:-99,eAuctionType:"Unlockable" } 
                   , {new: true },function(err, response) { });

                  

               
            }else{

                //Decrease quantitiy of nft owner in 1155
                NFTowners.findOneAndUpdate({ nftId: req.body.oNFTId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: -req.body.nQuantity,nQuantityLeft:-req.body.nQuantity } },
                     {new: true },function(err, response) {
                         if(err){
                             console.log("owner not found")
                         }else{
                             console.log("response is----->",response)
                         }
                      });
                     console.log("IN 1155 transfer")

                     let nftOwner = await NFTowners.findOne({ nftId: req.body.oNFTId, oCurrentOwner: oRecipientID });  
                     if (!nftOwner) {
                        console.log("e auction type is-->",req.body)
                        const nftOwner = new NFTowners({
                            nftId: req.body.oNFTId,
                            eType: req.body.eType,
                            nQuantity: req.body.nQuantity,
                            eAuctionType: "Unlockable",
                            nBasePrice: req.body.nBidPrice,  
                            oCurrentOwner: oRecipientID,
                            sTransactionStatus:-99,
                            nQuantityLeft:req.body.nQuantity
                        });
                        nftOwner.save();
                    }else{
                        NFTowners.findOneAndUpdate({ nftId: req.body.oNFTId, oCurrentOwner: oRecipientID }, { $inc: { nQuantity: req.body.nQuantity,nQuantityLeft:req.body.nQuantity } }, 
                            {new: true },function(err, response) {
                                if(err){
                                    console.log("err in transfer 1155",err)
                                }else{
                                    console.log("response in transfer 1155",response)
                                }
                             });
                    } 
            }

        }
        return res.reply(messages.successfully((req.body.eBidStatus == "Sold") ? "Bought" : (req.body.eBidStatus == "Transfer") ? "Transferred" : 'Bid Placed'))
        
    } catch (error) {
        console.log("Error is "+error)
        return res.reply(messages.server_error());
    }
};


controllers.getBidHistoryOfItem = async (req, res, next) => {
    try {
        if (!req.params.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!validators.isValidObjectID(req.params.nNFTId)) return res.reply(messages.invalid("NFT ID"));

        // var nLimit = parseInt(req.body.length);
        // var nOffset = parseInt(req.body.start);
        let data = await Bid.aggregate([{
            '$match': {
                'oNFTId': mongoose.Types.ObjectId(req.params.nNFTId),
                "sTransactionStatus": 1
            }
        }, {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oBidder': 1,
                'oNFTId': 1,
                'nBidPrice': 1,
                'sCreated': 1,
                "nQuantity": 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oBidder',
                'foreignField': '_id',
                'as': 'oBidder'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, { $unwind: '$oBidder' }, { $unwind: '$oRecipient' }, {
            '$facet': {
                'bids': [{
                    "$skip": +0
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        let iFiltered = data[0].bids.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: [],
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": 0,
            });
        } else {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: data[0].bids,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.toggleBidStatus = async (req, res, next) => {
    try {
        if (!req.body.eBidStatus) return res.reply(messages.not_found("Bid Status"));
        if (!req.body.oNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!req.body.oBidderId) return res.reply(messages.not_found("Bidder ID"));
        if (!req.body.sObjectId) return res.reply(messages.not_found("Object ID"));
        if (!req.body.sTransactionHash) return res.reply(messages.not_found("Transaction Hash"));

        if (!validators.isValidTransactionHash(req.body.sTransactionHash)) return res.reply(messages.invalid("Transaction Hash"));
        if (!validators.isValidObjectID(req.body.oNFTId)) return res.reply(messages.invalid("NFT ID"));
        if (!validators.isValidObjectID(req.body.oBidderId)) return res.reply(messages.invalid("Bidder ID"));
        if (!validators.isValidObjectID(req.body.sObjectId)) return res.reply(messages.invalid("Bid ID"));
        if (req.body.eBidStatus.trim() == "") return res.reply(messages.invalid("Bid Status"));

        if (req.body.eBidStatus == "Accepted") {

            let oNFT = await NFT.findById(req.body.oNFTId).catch((error) => {
                throw error;
            });
            if (!oNFT) return res.reply(messages.not_found('NFT'));

            let oBid = await Bid.findById(req.body.sObjectId).catch((error) => {
                throw error;
            });
            if (!oBid) return res.reply(messages.not_found('Bid'));

            let oNFTOfNewOwner = await NFT.findOne({
                nTokenID: oNFT.nTokenID,
                oCurrentOwner: req.body.oBidderId
            }, (error) => {
                if (error) throw error;
            });
            if (req.body.sCurrentUserEmail && req.body.sCurrentUserEmail != undefined && req.body.sCurrentUserEmail != '' && req.body.sCurrentUserEmail != '-') {
                console.log('----------------------------------send 1')
                let a = await nodemailer.send('Bid_Place.html', {
                    SITE_NAME: 'Djenerates',
                    USERNAME: req.body.sCurrentUserEmail,
                    ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`, // `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                    TEXT: 'Your Bid Has Been Accepted on NFT.'
                }, {
                    from: process.env.SMTP_USERNAME,
                    to: req.body.sCurrentUserEmail,
                    subject: 'Bid Accepted'
                });
                console.log('----------------------------------send 3', a);
            }
            console.log('====================================');
            console.log();
            console.log('====================================');

            if (oBid.nQuantity == oNFT.nQuantity) {
                // add quantity or transfer owner
                if (oNFTOfNewOwner) {
                    await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                        nQuantity: oNFTOfNewOwner.nQuantity + +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                    await NFT.findByIdAndDelete(oNFT._id).catch((error) => {
                        throw error;
                    });
                } else {
                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                        oCurrentOwner: req.body.oBidderId
                    });
                }
            } else if (oBid.nQuantity < oNFT.nQuantity) {
                // add and deduct quantity
                if (oNFTOfNewOwner) {
                    await NFT.findByIdAndUpdate(oNFTOfNewOwner._id, {
                        nQuantity: oNFTOfNewOwner.nQuantity + +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                    await NFT.findByIdAndUpdate(req.body.oNFTId, {
                        nQuantity: oNFT.nQuantity - +oBid.nQuantity
                    }).catch((error) => {
                        throw error;
                    });
                } else {
                    let newNFT = new NFT({
                        sHash: oNFT.sHash,
                        eType: oNFT.eType,
                        sCreated: oNFT.sCreated,
                        oPostedBy: oNFT.oPostedBy,
                        sCollection: oNFT.sCollection,
                        sName: oNFT.sName,
                        sCollaborator: oNFT.sCollaborator,
                        sNftdescription: oNFT.sNftdescription,
                        nCollaboratorPercentage: oNFT.nCollaboratorPercentage,
                        sSetRoyaltyPercentage: oNFT.sSetRoyaltyPercentage,
                        nBasePrice: oNFT.nBasePrice,
                        eAuctionType: oNFT.eAuctionType,
                        nTokenID: oNFT.nTokenID,
                        sTransactionHash: oNFT.sTransactionHash,
                        sTransactionStatus: oNFT.sTransactionStatus,
                        nQuantity: oBid.nQuantity,
                        oCurrentOwner: req.body.oBidderId,

                        sGenre:  oNFT.sGenre,
                        sBpm:  oNFT.sBpm,
                        skey_equalTo:  oNFT.skey_equalTo,
                        skey_harmonicTo:  oNFT.skey_harmonicTo,
                        track_cover: oNFT.track_cover,
                        
                    });
                    await newNFT.save().then(async () => {
                        await NFT.findByIdAndUpdate(req.body.oNFTId, {
                            nQuantity: oNFT.nQuantity - +oBid.nQuantity
                        }).catch((error) => {
                            throw error;
                        });
                    }).catch((error) => {
                        throw error;
                        // if (error) return res.reply(messages.server_error());
                    });
                }
            } else {
                return res.reply(messages.invalid("Quantity"));
            }
        }
        Bid.findByIdAndUpdate(req.body.sObjectId, {
            eBidStatus: req.body.eBidStatus,
            sTransactionStatus: 0,
            sTransactionHash: req.body.sTransactionHash
        },
            (err, bid) => {
                if (err) {
                    log.red(err);
                    throw err;
                }
                if (!bid) return res.reply(messages.not_found('Bid'));

                if (req.body.eBidStatus == "Rejected") {

                    if (req.body.sCurrentUserEmail && req.body.sCurrentUserEmail != undefined && req.body.sCurrentUserEmail != '' && req.body.sCurrentUserEmail != '-') {

                        nodemailer.send('Bid_Place.html', {
                            SITE_NAME: 'Djenerates',
                            USERNAME: req.body.sCurrentUserEmail,
                            ACTIVELINK: `${process.env.URL}/NFT-detail/${req.body.oNFTId}`,// `${process.env.URL}:${process.env.PORT}/viewNFT/${req.body.oNFTId}`,
                            TEXT: 'Your Bid Has Been Rejected on NFT.'
                        }, {
                            from: process.env.SMTP_USERNAME,
                            to: req.body.sCurrentUserEmail,
                            subject: 'Bid Rejected'
                        });

                    }
                }

                // Reject all other bids if any one Bid is accepted
                if (req.body.eBidStatus == "Accepted") {
                    Bid.updateMany({
                        eBidStatus: {
                            $eq: "Bid"
                        },
                        oNFTId: {
                            $eq: req.body.oNFTId
                        }
                    }, {
                        eBidStatus: "Rejected"
                    }, (err, result) => {
                        if (err) throw err;
                    });
                }
                return res.reply(messages.updated('Bid Status'));
            });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}
controllers.bidByUser = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        var nLimit = req.body.length && req.body.length != undefined ? parseInt(req.body.length) : 5000;
        var nOffset = req.body.start && req.body.start != undefined ? parseInt(req.body.start) : 0;

        let data = await Bid.aggregate([{
            '$match': {
                $and: [{
                    'oBidder': mongoose.Types.ObjectId(req.userId),
                }, {
                    eBidStatus: {
                        $ne: "Sold"
                    }
                }, {
                    eBidStatus: {
                        $ne: "Transfer"
                    }
                }]
            }
        },{
            '$lookup': {
                'from': 'nfts',
                'localField': 'oNFTId',
                'foreignField': '_id',
                'as': 'oNFT'
            }
        }, { $unwind: '$oNFT' },  {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oNFTId': 1,
                "sTransactionStatus": 1,
                nBidPrice: 1,
                oNFT:1,
                user_likes: {
                    "$size": {
                        "$filter": {
                            "input": "$oNFT.user_likes",
                            "as": "user_likes",
                            "cond": {
                                $eq: ["$$user_likes", req.userId && req.userId != undefined && req.userId != null ? mongoose.Types.ObjectId(req.userId): '' ]
                            }
                        }
                    }
                },
                user_likes_size: {
                    $cond: {
                        if: {
                            $isArray: "$oNFT.user_likes"
                        },
                        then: {
                            $size: "$oNFT.user_likes"
                        },
                        else: 0
                    }
                }
            }
        }, {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oNFTId': 1,
                "sTransactionStatus": 1,
                nBidPrice: 1,
                oNFT:1,
                is_user_like: {
                    $cond: {
                        if: {
                            $gte: ["$user_likes", 1]
                        },
                        then: 'true',
                        else: 'false'
                    }
                },
                user_likes_size: 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, { $unwind: '$oRecipient' }, {
            '$sort': {
                '_id': -1
            }
        }, {
            '$facet': {
                'nfts': [{
                    "$skip": +nOffset
                }, {
                    "$limit": +nLimit
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        console.log(data[0].nfts)

        let iFiltered = data[0].nfts.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.not_found('Data'))
        } else {
            return res.reply(messages.no_prefix('NFT Details'), {
                data: data[0].nfts,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}


controllers.getHistoryOfToken = async (req, res, next) => {
    try {
        if (!req.params.nTokenID) return res.reply(messages.not_found("NFT token ID"));

        // var nLimit = parseInt(req.body.length);
        // var nOffset = parseInt(req.body.start);
        let data = await Bid.aggregate([{
            '$match': {
                'nTokenID': parseInt(req.params.nTokenID),
                "sTransactionStatus": 1
            }
        }, {
            '$project': {
                '_id': 1,
                'eBidStatus': 1,
                'oRecipient': 1,
                'oBidder': 1,
                'oNFTId': 1,
                'nBidPrice': 1,
                'sCreated': 1,
                "nQuantity": 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oBidder',
                'foreignField': '_id',
                'as': 'oBidder'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, { $unwind: '$oBidder' }, { $unwind: '$oRecipient' }, {
            '$facet': {
                'bids': [{
                    "$skip": +0
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        let iFiltered = data[0].bids.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.no_prefix('Token history Details'), {
                data: [],
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": 0,
            });
        } else {
            return res.reply(messages.no_prefix('Token history Details'), {
                data: data[0].bids,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.getAllAuctionbids=async(req,res)=>{
    try{
        let nftAuctionBids={}
        nftAuctionBids = await AuctionBid.find({ oNFTId: req.params.nNFTId, eBidStatus:"Bid" });
        return res.reply(messages.success(), nftAuctionBids);
    }catch(e){
        console.log("error in getAllAuctionbids is-->",e);
        return e;
    }
}

controllers.getAuctionBidsHistory = async (req, res, next) => {
    try {
        if (!req.params.nNFTId) return res.reply(messages.not_found("NFT ID"));
        if (!validators.isValidObjectID(req.params.nNFTId)) return res.reply(messages.invalid("NFT ID"));
        let data = await AuctionBid.aggregate([{
            '$match': {
                'oNFTId': mongoose.Types.ObjectId(req.params.nNFTId),
                "eBidStatus": "Bid"
            }
        }, {
            '$project': {
                '_id': 1,
                'sOrder': 1,
                'sSignature': 1,
                'oBidder': 1,
                'oRecipient': 1,
                'eBidStatus': 1,
                'oNFTId': 1,
                'nBidPrice': 1,
                'sTransactionHash': 1,
                'nQuantity': 1,
                'nTokenID': 1,
                'sCreated': 1
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oRecipient',
                'foreignField': '_id',
                'as': 'oRecipient'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'oBidder',
                'foreignField': '_id',
                'as': 'oBidder'
            }
        }, {
            '$sort': {
                'sCreated': -1
            }
        }, { $unwind: '$oBidder' }, { $unwind: '$oRecipient' }, {
            '$facet': {
                'bids': [{
                    "$skip": +0
                }],
                'totalCount': [{
                    '$count': 'count'
                }]
            }
        }]);
        let iFiltered = data[0].bids.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: [],
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": 0,
            });
        } else {
            return res.reply(messages.no_prefix('Bid Details'), {
                data: data[0].bids,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.getCurrentAuctionBids=async(req,res)=>{
    try{
        if (!req.userId) return res.reply(messages.unauthorized());
        let nftCurrentOwnerAuctionBids={}
        nftCurrentOwnerAuctionBids = await AuctionBid.find({ oNFTId:req.params.nNFTId, oBidder:req.userId, eBidStatus:"Bid" });
        return res.reply(messages.success(), nftCurrentOwnerAuctionBids);
    }catch(e){
        console.log("error in getAllAuctionbids is-->",e);
        return e;
    }
}
controllers.getSelectedAuctionBids=async(req,res)=>{
    try{
        if (!req.userId) return res.reply(messages.unauthorized());
        let nftCurrentOwnerAuctionBids={}
        nftCurrentOwnerAuctionBids = await AuctionBid.find({ oNFTId:req.params.nNFTId, oRecipient:req.params.Owner, oBidder:req.userId, eBidStatus:"Bid" });
        return res.reply(messages.success(), nftCurrentOwnerAuctionBids);
    }catch(e){
        console.log("error in getAllAuctionbids is-->",e);
        return e;
    }
}
controllers.getCurrentAuctionBidsList=async(req,res)=>{
    try{
        if (!req.userId) return res.reply(messages.unauthorized());
        let nftCurrentOwnerAuctionBidsList={}
        nftCurrentOwnerAuctionBidsList = await AuctionBid.find({ oNFTId:req.params.nNFTId, oBidder:req.userId }).sort({sCreated: -1});
        return res.reply(messages.success(), nftCurrentOwnerAuctionBidsList);
    }catch(e){
        console.log("error in getAllAuctionbidsList is-->",e);
        return e;
    }
}

controllers.removeAuctionBidRecords = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        var oNFTId = req.body.oNFTId;
        AuctionBid.findOneAndUpdate({ 
            oNFTId:oNFTId, 
            oBidder:req.userId, 
            eBidStatus:"Bid" 
        }, 
        {
            eBidStatus:"Canceled"
        }, (err, cancelbid) => {
            if(err){
                return res.reply(messages.server_error());
            }
            if(cancelbid){
                Bid.findOneAndUpdate({ oBidder: req.userId, oNFTId: oNFTId, eBidStatus: "Bid" },{ eBidStatus:"Canceled" }, (err, bid) => { });
                return res.reply(messages.successfully('Bid Cancelled successfully'), cancelbid);
            }
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.rejectAuctionBidRecords = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        var oNFTId = req.body.oNFTId;
        var oBidder = req.body.oBidder;
        AuctionBid.findOneAndUpdate({ 
            oNFTId:oNFTId, 
            oBidder:oBidder, 
            oRecipient:req.userId,
            eBidStatus:"Bid" 
        }, 
        {
            eBidStatus:"Rejected"
        }, (err, cancelbid) => {
            if(err){
                return res.reply(messages.server_error());
            }
            if(cancelbid){
                Bid.findOneAndUpdate({ oBidder:oBidder, oRecipient: req.userId, oNFTId: oNFTId, eBidStatus: "Bid" },{ eBidStatus:"Rejected" }, (err, bid) => { });
                return res.reply(messages.successfully('Bid Rejected successfully'), cancelbid);
            }
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.rejectAuctionbid = async (req, res, next) => {
    try {
        let auctionBidId = req.body.auctionbidId;
        let oNFTId = req.body.oNFTId;
        let oBidder = req.body.oBidder;
        AuctionBid.findByIdAndUpdate(auctionBidId, {
            eBidStatus:"Rejected"
        }).catch((error) => {
            throw error;
        });
        Bid.findOneAndUpdate({ oBidder: oBidder, oNFTId: oNFTId, eBidStatus: "Bid" },{ eBidStatus:"Rejected" }, (err, bid) => { 
            return res.reply(messages.successfully('Bid Rejected successfully'), bid);
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.acceptAuctionbid = async (req, res, next) => {
    try {
        console.log(" Inside try");
        let auctionBidId = req.body.auctionbidId;
        let oNFTId = req.body.oNFTId;
        let oBidder = req.body.oBidder;
        let oRecipient = req.body.oRecipient;
        AuctionBid.findByIdAndUpdate( auctionBidId, { eBidStatus:"Accepted" }).catch((error) => { console.log("Error in Auction"); throw error; });
        console.log(" Auction Update");

        console.log(oBidder+" - "+oRecipient+" - "+oNFTId)
        Bid.findOneAndUpdate({ 
            oBidder: mongoose.Types.ObjectId(oBidder), 
            oRecipient: mongoose.Types.ObjectId(oRecipient), 
            oNFTId: mongoose.Types.ObjectId(oNFTId), 
            eBidStatus: "Bid" 
        },{ eBidStatus:"Accepted" }, (err, bid) => { 
            if(err){
                console.log(" Bid Update Error" + err);
            }
            if(bid){
                console.log(" Bid Update msg" + bid);
            }
        });
        console.log(" Bid Update");

        if(req.body.nftERC721Type){

            AuctionBid.updateMany({ 
                oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                oRecipient: mongoose.Types.ObjectId(oRecipient), 
                oNFTId: mongoose.Types.ObjectId(oNFTId), 
                eBidStatus: "Bid" 
            },{ eBidStatus:"Rejected" }, function( err, result ) {
                if (err) {
                    console.log(" Error in rejecting other Auction Bids" + err);
                }
            });
            console.log(" Cancel Auction Update");

            Bid.updateMany({ 
                oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                oRecipient: mongoose.Types.ObjectId(oRecipient), 
                oNFTId: mongoose.Types.ObjectId(oNFTId), 
                eBidStatus: "Bid"
            },{ eBidStatus:"Rejected" }, function( err, result ) {
                if (err) {
                    console.log(" Error in rejecting other Bids" + err);
                }
            });

            console.log("Cancel bid Update");
        }
        
        /*Save data nftowner id here*/
        console.log(" Inside S/Transfer Calleddd");
        
        if(req.body.nftERC721Type){
            await NFT.findByIdAndUpdate(oNFTId, {
                sTransactionStatus: -99,
                oCurrentOwner: mongoose.Types.ObjectId(oBidder)
            }).catch((error) => {
                throw error;
            });
            await NFTowners.findOneAndUpdate({
                nftId: mongoose.Types.ObjectId(oNFTId) 
            }, {
                sTransactionStatus: -99,
                nBasePrice: req.body.nBidPrice,
                eAuctionType: "Auction",
                oCurrentOwner: mongoose.Types.ObjectId(oBidder)
            }).catch((error) => {
                throw error;
            });
            return res.reply(messages.successfully('Bid Accepted successfully'));
        }else{
            console.log("Inside ERC1155");
            let updateQty = parseInt(req.body.nQuantity);
            let updateQty2 = -updateQty;
            let db_nftId = mongoose.Types.ObjectId(oNFTId);
            let db_oCurrentOwner = mongoose.Types.ObjectId(req.userId);
            let db_oRecipientID = mongoose.Types.ObjectId(req.body.oBidder);

            

            /******************************** Transfering and Updating NFT owner Starts ************************************/
            let nftOwner = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oRecipientID });
            if (!nftOwner) {
                const NewnftOwner = new NFTowners({
                    nftId: oNFTId,
                    nQuantity: req.body.nQuantity,
                    eAuctionType: "Auction",
                    nBasePrice: req.body.nBidPrice,
                    oCurrentOwner: db_oRecipientID,
                    sTransactionStatus:-99,
                    nQuantityLeft:req.body.nQuantity
                });
                NewnftOwner.save();
            }else{
                /********************************** Check If NFT is on Marketplace Start ****************************************/
                
                
                if(!req.body.nftERC721Type){
                    await NFT.findByIdAndUpdate(
                        oNFTId,
                      { $inc: { nQuantityOnSale: updateQty2 } }
                    ).then((err, nft) => {
                   
                    });
                   }
                
                //--------------------------->
                try{
                    let nftOldData = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oRecipientID, sTransactionStatus: 1 });
                    console.log("nftOldData " + nftOldData);
                    nftOldData = nftOldData.toObject();
                    console.log("left qty is " + nftOldData.nQuantityLeft);
                    if(nftOldData.nQuantityLeft <= 0){
                        console.log("left qty 0");
                        NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty } }, {new: true },function(err, response) { });
                    }else{
                        console.log("left qty 0");
                        NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty, nQuantityLeft:updateQty } }, {new: true },function(err, response) { });
                    }

                }catch(e){ console.log("Error 1" + e); }
                /********************************** Check If NFT is on Marketplace Ends ****************************************/


                /********************************** Check If NFT is not on Marketplace Start ****************************************/
                try{
                    let nftOldData = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oRecipientID, sTransactionStatus: -99 });
                    console.log("nftOldData " + nftOldData);
                    nftOldData = nftOldData.toObject();
                    console.log("left qty is " + nftOldData.nQuantityLeft);
                    if(nftOldData.nQuantityLeft <= 0){
                        console.log("left qty 0");
                        NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty }, eAuctionType: "Auction", nBasePrice: req.body.nBidPrice  }, {new: true },function(err, response) { });
                    }else{
                        console.log("left qty 0");
                        NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oRecipientID }, { $inc: { nQuantity: updateQty, nQuantityLeft:updateQty }, eAuctionType: "Auction", nBasePrice: req.body.nBidPrice }, {new: true },function(err, response) { });
                    }

                }catch(e){ console.log("Error 1" + e); }
                /********************************** Check If NFT is not on Marketplace Start ****************************************/

            }
            /******************************** Transfering and Updating NFT owner Ends ************************************/

            /************************ Rejecting All Bids if Bid Qty less than Available Starts ************************** */
            let nftOwnerData = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner });
            if(nftOwnerData){
                console.log("nftOwnerData " + nftOwnerData);
                nftOwnerData = nftOwnerData.toObject();
                console.log("left qty is " + nftOwnerData.nQuantityLeft);
                console.log("Qty "+nftOwnerData.nQuantity+ "LEFT Qty "+ nftOwnerData.nQuantityLeft + " BId Qty" + updateQty );

                let availableQty = nftOwnerData.nQuantity - nftOwnerData.nQuantityLeft - updateQty;
                console.log("Available Qty is "+ availableQty);
                AuctionBid.updateMany({ 
                    oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                    oRecipient: mongoose.Types.ObjectId(oRecipient), 
                    oNFTId: mongoose.Types.ObjectId(oNFTId), 
                    nQuantity : { $gt : availableQty },
                    eBidStatus: "Bid" 
                },{ eBidStatus:"Rejected" }, function( err, result ) {
                    if (err) {
                        console.log(" Error in rejecting other Auction Bids" + err);
                    }
                });
                console.log(" Cancel Auction Update");

                Bid.updateMany({ 
                    oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                    oRecipient: mongoose.Types.ObjectId(oRecipient), 
                    oNFTId: mongoose.Types.ObjectId(oNFTId), 
                    nQuantity : { $gt : availableQty },
                    eBidStatus: "Bid"
                },{ eBidStatus:"Rejected" }, function( err, result ) {
                    if (err) {
                        console.log(" Error in rejecting other Bids" + err);
                    }
                });
            }

            /************************ Rejecting All Bids if Bid Qty less than Available Ends ************************** */


            NFTowners.findOneAndUpdate({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner }, { $inc: { nQuantity: updateQty2 } }, {new: true },function(err, response) {});
            
            let nftOldData2 = await NFTowners.findOne({ nftId: db_nftId, oCurrentOwner: db_oCurrentOwner });
            console.log("nftOldData2 " + nftOldData2);
            nftOldData2 = nftOldData2.toObject();
            console.log("left qty Next is " + nftOldData2.nQuantity);
            if(nftOldData2.nQuantity <= 0){
                AuctionBid.updateMany({ 
                    oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                    oRecipient: mongoose.Types.ObjectId(oRecipient), 
                    oNFTId: mongoose.Types.ObjectId(oNFTId), 
                    eBidStatus: "Bid" 
                },{ eBidStatus:"Rejected" }, function( err, result ) {
                    if (err) {
                        console.log(" Error in rejecting other Auction Bids" + err);
                    }
                });
                console.log(" Cancel Auction Update");
    
                Bid.updateMany({ 
                    oBidder: { $ne: mongoose.Types.ObjectId(oBidder) }, 
                    oRecipient: mongoose.Types.ObjectId(oRecipient), 
                    oNFTId: mongoose.Types.ObjectId(oNFTId), 
                    eBidStatus: "Bid"
                },{ eBidStatus:"Rejected" }, function( err, result ) {
                    if (err) {
                        console.log(" Error in rejecting other Bids" + err);
                    }
                });
            }
            return res.reply(messages.successfully('Bid Accepted successfully'));
        }
    } catch (error) {
        return res.reply(messages.server_error());
    }
}


module.exports = controllers;