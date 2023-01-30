const fs=require('fs');
const cloudinary=require('cloudinary').v2;
const multer=require('multer');
const ipfsAPI=require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https',auth: '21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439'});
const {
    User,
    NFT,
    Bid,
    NewsLetterEmail,
    Category,
    Aboutus,
    Terms,
    FAQs,
    Banner,
    NFTowners
}=require('../../../models');
const {
    nodemailer
}=require('../../../utils/index');
const validators=require("./validators");

const controllers={};

const mongoose=require("mongoose");


const storage=multer.diskStorage({
    destination: (req,file,callback) => {
        callback(null,process.cwd()+'/nft');
    },
    filename: (req,file,callback) => {
        callback(null,new Date().getTime()+'_'+file.originalname);
    }
});
let oMulterObj={
    storage: storage,
    limits: {
        fileSize: 100*1024*1024, // 100mb
    },
};

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const upload=multer(oMulterObj).single('userProfile');

//const uploadBanner=multer(oMulterObj).single('banner_image');
const uploadBanner=multer(oMulterObj);

controllers.updateProfile=async (req,res,next) => {

    try {
        if(!req.userId) return res.reply(messages.unauthorized());

        let oProfileDetails={};

        await upload(req,res,async (erro) => {

            if(!req.body.sUserName) return res.reply(messages.not_found("User Name"));
            if(!req.body.sFirstname) return res.reply(messages.not_found("First Name"));
            if(!req.body.sLastname) return res.reply(messages.not_found("Last Name"));

            if(_.isUserName(req.body.sUserName)) return res.reply(messages.invalid("User Name"));
            if(_.isUserName(req.body.sFirstname)) return res.reply(messages.invalid("First Name"));
            if(_.isUserName(req.body.sLastname)) return res.reply(messages.invalid("Last Name"));

            oProfileDetails={
                sUserName: req.body.sUserName,
                oName: {
                    sFirstname: req.body.sFirstname,
                    sLastname: req.body.sLastname
                },
            };
            // if (req.file != undefined) {

            //     await cloudinary.uploader.upload(req.file.path, {
            //         folder: "Djenerates/User_Profile"
            //     })
            //         .then(image => {
            //             oProfileDetails["sProfilePicUrl"] = image.url;
            //             fs.unlinkSync(req.file.path);
            //         })
            //         .catch(err => {
            //             if (err) return res.reply(messages.error("Image Upload Failed"));
            //         });
            // }
            User.findByIdAndUpdate(req.userId,oProfileDetails,
                (err,user) => {
                    if(err) return res.reply(messages.server_error());
                    if(!user) return res.reply(messages.not_found('User'));
                    req.session["admin_firstname"]=req.body.sFirstname;
                    return res.reply(messages.updated('Admin Profile'));
                });
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.getDashboardData=async (req,res) => {
    try {
        if(!req.userId) return res.reply(messages.unauthorized());

        let nTotalRegisterUsers=0;

        nTotalRegisterUsers=await User.collection.countDocuments({
            sRole: 'user'
        });
        let data=await User.aggregate([{
            $match: {
                sRole: 'user'
            }
        },
        {
            $group: {
                _id: {
                    day: {
                        $dayOfMonth: "$sCreated"
                    },
                    month: {
                        $month: "$sCreated"
                    },
                    year: {
                        $year: "$sCreated"
                    }
                },
                count: {
                    $sum: 1
                },
                date: {
                    $first: "$sCreated"
                },
            },
        },
        {
            $sort: {
                date: -1
            }
        }
        ]);

        let aFixedSaleNFTsCount=await NFT.aggregate([{
            $match: {
                eAuctionType: 'Fixed Sale',
                sTransactionStatus:1,
                
                    nQuantityOnSale: {
                      $ne: 0,
                    },
                    
                  
              
            }
        },{
            $group: {
                _id: 'Fixed Sale',
                count: {
                    $sum: 1
                }
            }
        }]);

        let aAuctionNFTsCount=await NFT.aggregate([{
            $match: {
                eAuctionType: 'Auction',
                sTransactionStatus:1,
                nQuantityOnSale: {
                    $ne: 0,
                  },
            }
        },{
            $group: {
                _id: 'Auction',
                count: {
                    $sum: 1
                }
            }
        }]);

        let aSoldNFTsCount=await Bid.aggregate([{
            '$match': {
                '$or': [{
                    'eBidStatus': 'Sold'
                },{
                    'eBidStatus': 'Accepted'
                }]
            }
        },{
            '$group': {
                '_id': 'Sold',
                'count': {
                    '$sum': 1
                }
            }
        }]);

        return res.reply(messages.success(),{
            nTotalRegisterUsers,
            data,
            nFixedSaleNFTsCount: (!aFixedSaleNFTsCount[0])? 0:aFixedSaleNFTsCount[0].count,
            nAuctionNFTsCount: (!aAuctionNFTsCount[0])? 0:aAuctionNFTsCount[0].count,
            nSoldNFTsCount: (!aSoldNFTsCount[0])? 0:aSoldNFTsCount[0].count
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
};

controllers.users=async (req,res,next) => {
    try {
        // Per page limit
        var nLimit=parseInt(req.body.length);
        // From where to start
        var nOffset=parseInt(req.body.start);

        // Get total number of records
        let nTotalUsers=await User.countDocuments({
            "sRole": {
                $ne: "admin"
            }
        });

        var oSearchData={
            $or: []
        };

        if(req.body.search.value!='') {

            var re=new RegExp(`.*${req.body.search.value}.*`,'i');

            oSearchData['$or'].push({
                'sWalletAddress': re
            });
        }

        if(!oSearchData['$or'].length) {
            delete oSearchData['$or'];
        }

        let oSortingOrder={};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data]=(req.body.order[0].dir=="asc")? 1:-1;

        let aUsers=await User.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                "$and": [{
                    "sRole": {
                        $eq: "user"
                    }
                },oSearchData]
            }
        },
        {
            "$project": {
                sUserName: 1,
                sWalletAddress: 1,
                sStatus: 1
            }
        },
        {
            "$limit": nOffset+nLimit
        },
        {
            "$skip": nOffset
        }
        ]);

        let nNumberOfRecordsInSearch=await User.aggregate([{
            "$match": {
                "$and": [{
                    "sRole": {
                        $eq: "user"
                    }
                },oSearchData]
            }
        }]);

        return res.reply(messages.success(),{
            data: aUsers,
            draw: req.body.draw,
            "recordsTotal": nTotalUsers,
            "recordsFiltered": nNumberOfRecordsInSearch.length
        });

    } catch(err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.nfts=async (req,res,next) => {
    try {
        // Per page limit
        var nLimit=parseInt(req.body.length);
        // From where to start
        var nOffset=parseInt(req.body.start);


        // Get total number of records
        let nTotalNFTs=await NFT.countDocuments();

        var oSearchData={
            $or: []
        };

        if(req.body.search.value!='') {
            var re=new RegExp(`.*${req.body.search.value}.*`,'i');
            oSearchData['$or'].push({
                'sName': re
            });
        }

        if(!oSearchData['$or'].length) {
            delete oSearchData['$or'];
        }

        let oSortingOrder={};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data]=(req.body.order[0].dir=="asc")? 1:-1;

        let aNFTs=await NFT.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                "$and": [oSearchData]
            }
        },
        {
            "$limit": nOffset+nLimit
        },
        {
            "$skip": nOffset
        },
        {
            '$lookup': {
                'from': 'users',
                'localField': 'oPostedBy',
                'foreignField': '_id',
                'as': 'oCreator'
            }
        },{
            '$lookup': {
                'from': 'users',
                'localField': 'oCurrentOwner',
                'foreignField': '_id',
                'as': 'oOwner'
            }
        }
        ]);

        let nNumberOfRecordsInSearch=await NFT.aggregate([{
            "$match": {
                "$and": [oSearchData]
            }
        }]);

        // If no record found
        if(!aNFTs.length) {
            return res.reply(messages.success(),{
                data: [],
                draw: req.body.draw,
                "recordsTotal": nTotalNFTs,
                "recordsFiltered": 0
            });
        }



        return res.reply(messages.success(),{
            data: aNFTs,
            draw: req.body.draw,
            "recordsTotal": nTotalNFTs,
            "recordsFiltered": nNumberOfRecordsInSearch.length
        });

    } catch(err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}

controllers.toggleUserStatus=async (req,res,next) => {
    try {

        if(!req.body.sObjectId) return res.reply(messages.not_found("User ID"));
        if(!req.body.sStatus) return res.reply(messages.not_found("Status"));

        if(!validators.isValidUserStatus(req.body.sStatus)) return res.reply(messages.invalid("Status"));
        if(!validators.isValidObjectID(req.body.sObjectId)) res.reply(messages.invalid("User ID"));

        
        console.log("res pont in toggle is--->")
      
        User.findByIdAndUpdate(req.body.sObjectId,{
            sStatus: req.body.sStatus
        },
            (err,user) => {
                if(err) {
                    log.red(err);
                    return res.reply(messages.server_error());
                }
                if(!user) return res.reply(messages.not_found('User'));
                try{
                    if(req.body.sStatus=="deactivated") {
       
                        NFT.updateMany({"oCurrentOwner": req.body.sObjectId},
                            {
                                $set: {
                                    "sTransactionStatus": -2
                                }
                            },(err,NFTowners) => {
                                if(err) {
                                    log.red(err);
                                    return res.reply(messages.server_error());
                                }
                                if(!NFTowners) return res.reply(messages.not_found('NFTowner'))
                              
                            })
                            NFTowners.updateMany({"oCurrentOwner": req.body.sObjectId},
                            {
                                $set: {
                                    "sTransactionStatus": -2
                                }
                            },(err,NFTowners) => {
                                if(err) {
                                    log.red(err);
                                    return res.reply(messages.server_error());
                                }
                                if(!NFTowners) return res.reply(messages.not_found('NFTowner'))
                              
                            })
                    }else if(req.body.sStatus=="active"){
                        NFT.updateMany({"oCurrentOwner": req.body.sObjectId},
                        {
                            $set: {
                                "sTransactionStatus": -99
                            }
                        },(err,NFTowners) => {
                            if(err) {
                                log.red(err);
                                return res.reply(messages.server_error());
                            }
                            if(!NFTowners) return res.reply(messages.not_found('NFTowner'))
                          
                        })
                        NFTowners.updateMany({"oCurrentOwner": req.body.sObjectId},
                        {
                            $set: {
                                "sTransactionStatus": -99
                            }
                        },(err,NFTowners) => {
                            if(err) {
                                log.red(err);
                                return res.reply(messages.server_error());
                            }
                            if(!NFTowners) return res.reply(messages.not_found('NFTowner'))
                          
                        })
                    } else {
                        console.log("user status is not deactivated")
                    } 
                }catch(e){
                    
                }
              
                
                return res.reply(messages.updated('User Status'));
            });
       

    } catch(error) {
        return res.reply(messages.server_error());
    }
}


controllers.toggleNFTStatus=async (req,res,next) => {
    try {
        
        if(!req.body.sObjectId) return res.reply(messages.not_found("User ID"));
        if(!req.body.bStatus) return res.reply(messages.not_found("Status"));

       
        if(!validators.isValidObjectID(req.body.sObjectId)) res.reply(messages.invalid("User ID"));

        
     
        
    
        if(req.body.bStatus=="false") {
             
            NFT.findByIdAndUpdate( mongoose.Types.ObjectId(req.body.sObjectId),
                {
                   sTransactionStatus:-2
                },(err,NFT) => {
                    if(err) {
                        log.red(err);
                        return res.reply(messages.server_error());
                    }
                    if(!NFTowners) return res.reply(messages.not_found('NFT'))
                    
                })
            
        NFTowners.updateMany({nftId:req.body.sObjectId},{sTransactionStatus:-2},(err,NFTowner)=>{
            if(err) {
                log.red(err);
                return res.reply(messages.server_error());
            }
            if(!NFTowners) return res.reply(messages.not_found('NFT'))
            return res.reply(messages.updated('NFT Owner'));
        })
        } else if(req.body.bStatus=="true") {
            NFT.findByIdAndUpdate( mongoose.Types.ObjectId(req.body.sObjectId),
            {
               sTransactionStatus:-99
            },(err,NFTowners) => {
                if(err) {
                    log.red(err);
                    return res.reply(messages.server_error());
                }
                if(!NFTowners) return res.reply(messages.not_found('NFTowner'))
                
            })
            NFTowners.updateMany({nftId:req.body.sObjectId},{sTransactionStatus:-99},(err,NFTowner)=>{
                if(err) {
                    log.red(err);
                    return res.reply(messages.server_error());
                }
                if(!NFTowners) return res.reply(messages.not_found('NFT'))
                return res.reply(messages.updated('NFT Owner'));
            })
        }

    } catch(error) {
        return res.reply(messages.server_error());
    }
}

// ------- News Letter controllers --------
controllers.sendNewsLetterEmail=async (req,res,next) => {
    try {
        log.green(req.body);
        //if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.body) return res.reply(messages.not_found("Data"));
        if(!req.body.sSubject) return res.reply(messages.not_found("Mail Subject"));
        if(!req.body.sHTMLContent) return res.reply(messages.not_found("Mail Content"));

        let emailsArray=[];
        await (await NewsLetterEmail.aggregate([{
            $project: {
                sEmail: 1
            }
        }]))
            .forEach(function(aArrayDocs) {
                emailsArray.push(aArrayDocs.sEmail);
            });
        if(emailsArray.length>0) {

            await nodemailer.sendMail({
                from: 'Djenerates '+process.env.SMTP_USERNAME,
                bcc: emailsArray,
                subject: req.body.sSubject,
                html: req.body.sHTMLContent
            });

            return res.reply(messages.success("Email send"));
        } else {
            return res.reply(messages.no_prefix("No emails found"));
        }
    } catch(error) {
        console.log("error is---->",error)
        return res.reply(messages.server_error());
    }
};

controllers.getNewsLetterEmailsLists=async (req,res,next) => {
    try {
        await NewsLetterEmail.countDocuments({},async (err,nCount) => {
       let email=await NewsLetterEmail.find({},(err,aEmails) => {
                if(err) return res.reply(messages.error());
                let data=JSON.stringify({
                    "draw": req.body.draw,
                    "recordsFiltered": nCount,
                    "recordsTotal": nCount,
                    "data": aEmails
                });
                res.send(data);
            });
            console.log("ther is no email")
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
};

controllers.deleteNewsLetterEmail=async (req,res) => {
    try {
        NewsLetterEmail.findOneAndDelete({
            _id: req.headers._id
        },(err,result) => {
            if(err) return res.reply(messages.error());
            return res.reply(messages.success("Email deletion "),{
                email: result.sEmail
            });
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
};

// Category Controllers
controllers.addCategory=async (req,res) => {
    try {
        log.green(req.body);
        if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.body.sName) return res.reply(messages.not_found("Category"));
        if(!validators.isValidName(req.body.sName)) return res.reply(messages.invalid("Category"));

        const category=new Category({
            sName: req.body.sName
        });
        category.save()
            .then((oCategory) => {
                log.green('Category Created: '+oCategory.sName);
                return res.reply(messages.created("Category"));
            })
            .catch((err) => {
                log.red(err);
                return res.reply(messages.already_exists("Category"));
            })
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.getCategories=async (req,res) => {
    try {
        if(!req.userId) return res.reply(messages.unauthorized());
        // Per page limit
        var nLimit=parseInt(req.body.length);
        // From where to start
        var nOffset=parseInt(req.body.start);

        const nTotalCategories=await Category.countDocuments();

        let oSearchData={};
        let nTotalFilteredRecords;
        if(req.body.search.value!='') {
            oSearchData={
                sName: new RegExp(`.*${req.body.search.value}.*`,'i')
            }
            nTotalFilteredRecords=(await Category.aggregate([{
                $match: oSearchData
            }])).length;
        } else
            nTotalFilteredRecords=nTotalCategories;

        let oSortingOrder={};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data]=(req.body.order[0].dir=="asc")? 1:-1;


        const aCategories=await Category.aggregate([{
            $sort: oSortingOrder
        },{
            $match: oSearchData
        },{
            $project: {
                _id: 0,
                _v: 0
            }
        },{
            "$limit": nOffset+nLimit
        },{
            "$skip": nOffset
        }]);

        if(!aCategories.length) {
            return res.reply(messages.success(),{
                data: [],
                draw: req.body.draw,
                recordsTotal: nTotalCategories,
                recordsFiltered: 0
            });
        }

        return res.reply(messages.success(),{
            data: aCategories,
            draw: req.body.draw,
            recordsTotal: nTotalCategories,
            recordsFiltered: nTotalFilteredRecords
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.toggleCategory=async (req,res) => {
    try {
        log.green(req.body);
        log.green(req.params);
        if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.params) return res.reply(messages.not_found("Category"))
        if(!validators.isValidCategoryStatus(req.body.sStatus)) return res.reply(messages.invalid("Category"));

        Category.updateOne({
            sName: req.params.sName
        },{
            sStatus: req.body.sStatus
        },(err,oResult) => {
            if(err) return res.reply(messages.error());
            if(!oResult.n) return res.reply(messages.not_found('Category'));
            return res.reply(messages.updated("Category Status"));
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.deleteCategory=(req,res) => {
    try {
        log.green(req.params);
        if(!req.userId) return res.reply(messages.unauthorized());
        Category.deleteOne({
            sName: req.params.sName
        },(err,result) => {
            if(err) return res.reply(messages.error());
            if(!result.n) return res.reply(messages.not_found("Category"));

            return res.reply(messages.successfully("Deleted"));
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.editCategory=async (req,res) => {
    try {
        log.green(req.body);
        if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.body.sName) return res.reply(messages.not_found("Category"));
        if(!req.body.sNewName) return res.reply(messages.not_found("Category"));
        if(!validators.isValidName(req.body.sName)) return res.reply(messages.invalid("Category"));
        if(!validators.isValidName(req.body.sNewName)) return res.reply(messages.invalid("Category"));

        Category.updateOne({
            sName: req.body.sName
        },{
            sName: req.body.sNewName
        },(err,oResult) => {
            if(err) return res.reply(messages.error());
            if(!oResult.n) return res.reply(messages.not_found('Category'));
            return res.reply(messages.updated("Category"));
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

// CMS Controllers
controllers.updateAboutus=async (req,res) => {
    try {
        log.green(req.body);
        if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.body.sAboutus_data) return res.reply(messages.not_found("About Us Data"));

        await Aboutus.updateOne({},{
            $set: {
                sAboutus_data: req.body.sAboutus_data
            }
        },{
            upsert: true
        },(err) => {
            if(err) throw error;
        });
        return res.reply(messages.updated("Aboutus"));
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.updateFAQs=async (req,res) => {
    try {
        log.green(req.body);
        if(!req.userId) return res.reply(messages.unauthorized());

        const faqs=new FAQs({
            oFAQs_data: {
                sQuestion: req.body.sQuestion,
                sAnswer: req.body.sAnswer,
                
            },
            sOrder:req.body.order
        });
        faqs.save()
            .then((oFAQs) => {
                return res.reply(messages.created("FAQs"));
            })
            .catch((err) => {
                log.red(err);
                return res.reply(messages.server_error());
            })
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.updateTerms=async (req,res) => {
    try {
        log.green(req.body);
        if(!req.userId) return res.reply(messages.unauthorized());
        if(!req.body.sTerms_data) return res.reply(messages.not_found("Terms Data"));

        await Terms.updateOne({},{
            $set: {
                sTerms_data: req.body.sTerms_data
            }
        },{
            upsert: true
        },(err) => {
            if(err) throw error;
        });
        return res.reply(messages.updated("Terms & Condition"));
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.insertBanner=async (req,res) => {
    try {
        console.log("insert banner api is hit")
        
        allowedMimes=["image/jpeg","image/jpg","image/png","image/gif",];
        errAllowed="JPG, JPEG, PNG, GIF";
        uploadBanner.fields([{
            name: 'banner_image_desktop', maxCount: 1
          }, {
            name: 'banner_image_mobile', maxCount: 1
          }])(req,res,function(error) {
            if(error) {
                log.red(error);
                //fs.unlinkSync(req.files.path);
                return res.reply(messages.bad_request(error.message));
            } else {
                 console.log("Here");
                 log.green(req.body);
                // if (!req.body.banner_heading) {
                //     fs.unlinkSync(req.file.path);
                //     return res.reply(messages.not_found("Heading"));
                // }
                // if (!req.body.banner_sub_heading) {
                //     fs.unlinkSync(req.file.path);
                //     return res.reply(messages.not_found("Sub Heading"));
                // }
                if(!req.body.banner_URL) {
                    //fs.unlinkSync(req.file.path);
                    return res.reply(messages.not_found("URL"));
                }
              
          
                const desktop_image = req.files.banner_image_desktop[0];
                const mobile_image = req.files.banner_image_mobile[0];

               
                
                
                let mobile_hash;
                let desktop_hash;
                let testFile1=fs.readFileSync(desktop_image.path);
                let testFile2=fs.readFileSync(mobile_image.path);
                
                let testBuffer1=Buffer.from(testFile1);
                let testBuffer2=Buffer.from(testFile2);
                
                
                ipfs.files.add(testBuffer1).then(async (file2) => {
                    desktop_hash=await file2[0].hash
                 
                    ipfs.files.add(testBuffer2).then(async (file2) => {
                        mobile_hash=await file2[0].hash
                    
                        const banner=new Banner({
                            bDesktopFileHash:desktop_hash,
                            bMobileFileHash: mobile_hash,
                            bHeading: req.body.banner_heading,
                            bSubHeading: req.body.banner_sub_heading,
                            bannerURL: req.body.banner_URL,
                           
                        });
                        banner.save().then(async (result) => {
                            return res.reply(messages.created("Banner Successfully"),result);
                            // fs.unlinkSync(req.file.path);
                        }).catch((error) => {
                            console.log("Error"+error);
                            return res.reply(messages.error());
                        });
                        
                       
                    }).catch((e) => {
                        // fs.unlinkSync(req.file.path);
                        return res.reply(messages.error());
                    });
                   
                   
                }).catch((e) => {
                    // fs.unlinkSync(req.file.path);
                    return res.reply(messages.error());
                });
                
              
            }
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}
controllers.getbanners=async (req,res,next) => {
    try {
        // Per page limit
        var nLimit=parseInt(req.body.length);
        // From where to start
        var nOffset=parseInt(req.body.start);

        // Get total number of records
        let nTotalBanners=await Banner.countDocuments();
        var oSearchData={
            $or: []
        };
        if(req.body.search.value!='') {
            var re=new RegExp(`.*${req.body.search.value}.*`,'i');
            oSearchData['$or'].push({
                'bannerURL': re
            });
        }
        if(!oSearchData['$or'].length) {
            delete oSearchData['$or'];
        }
        let oSortingOrder={};
        oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data]=(req.body.order[0].dir=="asc")? 1:-1;

        let allBanners=await Banner.aggregate([{
            "$sort": oSortingOrder
        },
        {
            "$match": {
                "$and": [oSearchData]
            }
        },
        {
            "$limit": nOffset+nLimit
        },
        {
            "$skip": nOffset
        }
        ]);
        let nNumberOfRecordsInSearch=await Banner.aggregate([{
            "$match": {
                "$and": [oSearchData]
            }
        }]);
        // If no record found
        if(!allBanners.length) {
            return res.reply(messages.success(),{
                data: [],
                draw: req.body.draw,
                "recordsTotal": nTotalBanners,
                "recordsFiltered": 0
            });
        }
        return res.reply(messages.success(),{
            data: allBanners,
            draw: req.body.draw,
            "recordsTotal": nTotalBanners,
            "recordsFiltered": nNumberOfRecordsInSearch.length
        });
    } catch(err) {
        log.error(err)
        return res.reply(messages.server_error());
    }
}


//Deleting Faq
controllers.deleteFAQs=(req,res) => {
    try {
        log.green(req.body.sObjectId);

        if(!req.userId) return res.reply(messages.unauthorized());
        FAQs.deleteOne({_id: mongoose.Types.ObjectId(req.body.sObjectId)},(err,result) => {
            if(err) return res.reply(messages.error());
            if(!result.n) return res.reply(messages.not_found("Banner"));

            return res.reply(messages.successfully("Deleted"));
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}


controllers.deleteBanner=(req,res) => {
    try {
        log.green(req.body.sObjectId);

        if(!req.userId) return res.reply(messages.unauthorized());
        Banner.deleteOne({_id: mongoose.Types.ObjectId(req.body.sObjectId)},(err,result) => {
            if(err) return res.reply(messages.error());
            if(!result.n) return res.reply(messages.not_found("Banner"));

            return res.reply(messages.successfully("Deleted"));
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

//Getting a single Banner
controllers.getSingleBanner=async (req,res) => {
    try {
        log.green("object id is-->",req.body);
        if(!req.userId) return res.reply(messages.unauthorized());
        let banner=await Banner.findById({_id: mongoose.Types.ObjectId(req.body.sObjectId)},(err,result) => {
            if(err) return res.reply(messages.error());
            if(!result) return res.reply(messages.not_found("Banner"));

            return res.reply(messages.success(),
                result
            );
        });
    } catch(error) {
        return res.reply(messages.server_error());
    }
}

controllers.updateSingleBanner=async (req,res) => {
    try {
        console.log("inside update banner api")
        allowedMimes=["image/jpeg","image/jpg","image/png","image/gif",];
        errAllowed="JPG, JPEG, PNG, GIF";
        uploadBanner.fields([{
            name: 'banner_image_desktop', maxCount: 1
          }, {
            name: 'banner_image_mobile', maxCount: 1
          }])(req,res,function(error) {
            if(error) {
                log.red(error);
                //fs.unlinkSync(req.file.path);
                return res.reply(messages.bad_request(error.message));
            } else {
                 console.log("Here kj");
                 log.green(req.body);
                
                //if(!req.body.banner_URL) {
                //    //fs.unlinkSync(req.file.path);
                //    return res.reply(messages.not_found("URL"));
                //}
              
          
                const desktop_image = req.files.banner_image_desktop[0];
                const mobile_image = req.files.banner_image_mobile[0];

               
                
                
                let mobile_hash;
                let desktop_hash;
                let testFile1=fs.readFileSync(desktop_image.path);
                let testFile2=fs.readFileSync(mobile_image.path);
                
                let testBuffer1=Buffer.from(testFile1);
                let testBuffer2=Buffer.from(testFile2);
                
                
                ipfs.files.add(testBuffer1).then(async (file2) => {
                    desktop_hash=await file2[0].hash
                 
                    ipfs.files.add(testBuffer2).then(async (file2) => {
                        mobile_hash=await file2[0].hash
                        
                        
                        await Banner.findByIdAndUpdate(
                            mongoose.Types.ObjectId(req.body.sObjectId),
                            {
                                bDesktopFileHash:desktop_hash,
                                bMobileFileHash: mobile_hash,
                                
                                bannerURL: req.body.banner_URL,
                            },(err,result) => {
                                if(err) return res.reply(messages.error());
                                if(!result) return res.reply(messages.not_found("Banner"));
                                return res.reply(messages.success());
                            });
                    
                      
                        
                       
                    }).catch((e) => {
                        // fs.unlinkSync(req.file.path);
                        return res.reply(messages.error());
                    });
                   
                   
                }).catch((e) => {
                    // fs.unlinkSync(req.file.path);
                    return res.reply(messages.error());
                });
                
              
            }
        });


    } catch(error) {
        return res.reply(error);
    }
}

module.exports=controllers;