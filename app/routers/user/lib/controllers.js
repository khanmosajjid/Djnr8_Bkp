const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https',auth: '21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439'});
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const pinata = pinataSDK(process.env.PINATAAPIKEY, process.env.PINATASECRETAPIKEY);
const {
    User,
    NewsLetterEmail,
    Category,
    Aboutus,
    Terms,
    FAQs,
    NFT
} = require('../../../models');
const _ = require('../../../../globals/lib/helper');

const validators = require("./validators");
const {findOne}=require('../../../models/lib/User');
const controllers = {};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, process.cwd() + '/nft');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().getTime() + '_' + file.originalname);
    }
});
const clearStorage = () => {
  
    fs.readdir(process.cwd() + "/nft", (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        const absolutePath = path.resolve(process.cwd() + "/nft", file );      
        fs.unlink(absolutePath, err => {
          if (err) throw err;
        });
      }
    });
  }
let fileFilter = function (req, file, cb) {
    var allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: 'Invalid file type! Only JPG, JPEG & PNG image files are allowed.'
        }, false);
    }
};

let oMulterObj = {
    storage: storage,
    limits: {
        fileSize: 8 * 1024 * 1024 // 8mb
    },
    fileFilter: fileFilter
};

controllers.profile = (req, res) => {
    try {
        // if (!req.userId) {
        //     return res.reply(messages.unauthorized());
        // }
    
        User.findOne({
            _id: req.userId
        }, {
            oName: 1,
            sUserName: 1,
            sCreated: 1,
            sEmail: 1,
            sWalletAddress: 1,
            sProfilePicUrl: 1,
            sWebsite: 1,
            sBio: 1,
            sStatus:1
        }, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));
            return res.reply(messages.no_prefix('User Details'), user);
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

const upload = multer(oMulterObj).single('userProfile');

controllers.updateProfile = async (req, res, next) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        // File upload
        let oProfileDetails = {};

        await upload(req, res, async (error) => {

            if (error) return res.reply(messages.bad_request(error.message));

            if (!req.body.sUserName) return res.reply(messages.not_found("Username"));
            if (!req.body.sFirstname) return res.reply(messages.not_found("First Name"));
            if (!req.body.sLastname) return res.reply(messages.not_found("Last Name"));

            if (!validators.isValidString(req.body.sFirstname) || !validators.isValidName(req.body.sFirstname)) return res.reply(messages.invalid("First Name"));
            if (!validators.isValidString(req.body.sLastname) || !validators.isValidName(req.body.sLastname)) return res.reply(messages.invalid("Last Name"));
            if (!validators.isValidString(req.body.sUserName) || !validators.isValidName(req.body.sUserName)) return res.reply(messages.invalid("Username"));

            if (req.body.sWebsite.trim() != "") {
                if (req.body.sWebsite.trim().length > 2083)
                    return res.reply(messages.invalid("Website"));

                const reWebsite = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
                if (!reWebsite.test(req.body.sWebsite.trim()))
                    return res.reply(messages.invalid("Website"));
            }

            if (req.body.sBio.trim() != "")
                if (req.body.sBio.trim().length > 1000)
                    return res.reply(messages.invalid("Bio"));

            await User.findOne({
                sUserName: req.body.sUserName
            }, async (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (user)
                    if (user._id != req.userId)
                        return res.reply(messages.already_exists("User with Username '" + req.body.sUserName + "'"));

                oProfileDetails = {
                    sUserName: req.body.sUserName,
                    oName: {
                        sFirstname: req.body.sFirstname,
                        sLastname: req.body.sLastname
                    },
                    sWebsite: req.body.sWebsite,
                    sBio: req.body.sBio,
                    sEmail: req.body.sEmail,
                }
                if (req.file != undefined) {
                    const aAllowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
                    log.green(req.file.mimetype);
                    if (!aAllowedMimes.includes(req.file.mimetype)) {
                        return res.reply(messages.invalid("File Type"));
                    }
                    const oOptions = {
                        pinataMetadata: {
                            name: req.file.originalname,
                        },
                        pinataOptions: {
                            cidVersion: 0
                        }
                    };

                    const readableStreamForFile = fs.createReadStream(req.file.path);

                    let testFile = fs.readFileSync(req.file.path);
                    //Creating buffer for ipfs function to add file to the system
                    let testBuffer =  Buffer.from(testFile);

                    await ipfs.files.add(testBuffer).then(async (file2) => {
                        clearStorage()
                        oProfileDetails["sProfilePicUrl"] = file2[0].hash;
                       
                        
                    })
                    .catch((e) => {
                    // fs.unlinkSync(req.file.path);
                    return res.reply(messages.error());
                    });
                }
                await User.findByIdAndUpdate(req.userId, oProfileDetails,
                    (err, user) => {
                        if (err) return res.reply(messages.server_error());
                        if (!user) return res.reply(messages.not_found('User'));
                        req.session["name"] = req.body.sFirstname;
                        return res.reply(messages.updated('User Details'));
                    });

            });

        })
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.addCollaborator = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body) return res.reply(messages.not_found("Collaborator Details"));

        if (!validators.isValidWalletAddress(req.body.sAddress)) return res.reply(messages.invalid("Collaborator Address"));
        if (!validators.isValidString(req.body.sFullname) || !validators.isValidName(req.body.sFullname)) return res.reply(messages.invalid("Collaborator Name"));

        req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

        // let aUsers = await User.find({
        //     sWalletAddress: req.body.sAddress
        // });

        // if (!aUsers.length) return res.reply(messages.bad_request("User with the given address is not registered"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            if (user.sWalletAddress == req.body.sAddress) return res.reply(messages.bad_request("You Can't Add Yourself As a Collaborator"));

            let aUserCollaborators = user.aCollaborators;
            let bAlreadyExists;
            aUserCollaborators.forEach(oCollaborator => {
                if (oCollaborator.sAddress == req.body.sAddress) bAlreadyExists = true;
            });

            if (bAlreadyExists) return res.reply(messages.already_exists("Collaborator"));

            oCollaboratorDetails = {
                $push: {
                    aCollaborators: [req.body]
                }
            }
            User.findByIdAndUpdate(req.userId, oCollaboratorDetails, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Added'));
            });
        });

    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.collaboratorList = async (req, res) => {
    try {
        // Per page limit
        var nLimit = parseInt(req.body.length);
        // From where to start
        var nOffset = parseInt(req.body.start);

        let oAggregation = [{
            "$match": {
                "$and": [{
                    "_id": {
                        $eq: mongoose.Types.ObjectId(req.userId)
                    }
                }]
            }
        },
        {
            "$project": {
                "totalCollaborators": {
                    $cond: [{
                        $not: ["$aCollaborators"]
                    }, 0, {
                        $size: "$aCollaborators"
                    }]
                },
                "aCollaborators": {
                    $cond: [{
                        $not: ["$aCollaborators"]
                    },
                    [], {
                        $slice: ["$aCollaborators", nOffset, nLimit]
                    }
                    ]
                }
            }
        }
        ];

        let aUsers = await User.aggregate(oAggregation);

        let data = aUsers[0].aCollaborators;

        return res.status(200).json({
            message: 'Collaborator List Details',
            data: data,
            draw: req.body.draw,
            "recordsTotal": aUsers[0].totalCollaborators,
            "recordsFiltered": aUsers[0].totalCollaborators,
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.getCollaboratorList = (req, res) => {
    try {
        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));
            return res.reply(messages.successfully('Collaborator Detials'), user.aCollaborators);
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
};

controllers.addNewsLetterEmails = async (req, res) => {

    try {
        if (!req.body.sEmail) return res.reply(messages.required_field(" Email "));
        if (_.isEmail(req.body.sEmail)) return res.reply(messages.invalid('Email'));
       

        const newsLetterEmail = new NewsLetterEmail({
            
            sEmail: req.body.sEmail
        });
        newsLetterEmail.save()
            .then((result) => {
                return res.reply(messages.success(), {
                    
                    Email: req.body.sEmail
                });
            })
            .catch((error) => {
                if (error.code == 11000)
                    return res.reply(messages.already_exists('Email'));
                return res.reply(messages.error());
            });
    } catch (err) {
        return res.reply(messages.server_error());
    }
};

controllers.deleteCollaborator = (req, res) => {
    log.green(req.params.collaboratorAddress);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.params.collaboratorAddress) return res.reply(messages.not_found("Collaborator Address"));

        if (!validators.isValidWalletAddress(req.params.collaboratorAddress)) return res.reply(messages.invalid("Collaborator Address"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            let aUserCollaborators = user.aCollaborators;

            aUserCollaborators.forEach((oCollaborator, index) => {
                if (oCollaborator.sAddress == req.params.collaboratorAddress) {
                    aUserCollaborators[index] = aUserCollaborators[aUserCollaborators.length - 1];
                    aUserCollaborators.pop();
                    return;
                }
            });

            user.aCollaborators = aUserCollaborators;

            User.findByIdAndUpdate(req.userId, user, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Deleted'));
            });
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }


}

controllers.getCollaboratorName = (req, res) => {
    log.green(req.params.collaboratorAddress);
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.params.collaboratorAddress) return res.reply(messages.not_found("Collaborator Address"));

        if (!validators.isValidWalletAddress(req.params.collaboratorAddress)) return res.reply(messages.invalid("Collaborator Address"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            let aUserCollaborators = user.aCollaborators;

            if (!aUserCollaborators[0]) return res.reply(messages.not_found('Collaborator'));

            let oCollaborator;

            aUserCollaborators.forEach(collaborator => {
                if (collaborator.sAddress == req.params.collaboratorAddress) {
                    oCollaborator = collaborator;
                    return;
                }
            });

            return res.reply(messages.successfully('Details Found'), oCollaborator);
        });
    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.editCollaborator = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());
        if (!req.body) return res.reply(messages.not_found("Collaborator Details"));

        if (!validators.isValidWalletAddress(req.body.sAddress)) return res.reply(messages.invalid("Collaborator Address"));
        if (!validators.isValidWalletAddress(req.body.sPreviousAddress)) return res.reply(messages.invalid("Previous Address"));
        if (!validators.isValidString(req.body.sFullname) || !validators.isValidName(req.body.sFullname)) return res.reply(messages.invalid("Collaborator Name"));

        req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

        let aUsers = await User.find({
            sWalletAddress: req.body.sAddress
        });

        if (!aUsers.length) return res.reply(messages.bad_request("User with the given address is not registered"));

        User.findById(req.userId, (err, user) => {
            if (err) return res.reply(messages.server_error());
            if (!user) return res.reply(messages.not_found('User'));

            if (user.sWalletAddress == req.body.sAddress) return res.reply(messages.bad_request("You Can't Add Yourself As a Collaborator"));

            let aUserCollaborators = user.aCollaborators;
            aUserCollaborators.forEach((oCollaborator, index) => {
                if (oCollaborator.sAddress == req.body.sPreviousAddress) {
                    aUserCollaborators[index].sFullname = req.body.sFullname;
                    aUserCollaborators[index].sAddress = req.body.sAddress;
                    return;
                }
            });
            user.aCollaborators = aUserCollaborators;
            User.findByIdAndUpdate(req.userId, user, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));

                return res.reply(messages.successfully('Collaborator Updated'));
            });
        });

    } catch (error) {
        return res.reply(messages.server_error());
    }
}

controllers.getCategories = async (req, res) => {
    try {
        const aCategories = await Category.find({
            sStatus: {
                $ne: "Deactivated"
            }
        }, {
            _id: 0,
            sName: 1
        }).sort({
            sName: 1
        });

        return res.reply(messages.success(), {
            aCategories
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getAboutusData = async (req, res) => {
    try {
        const aAboutus = await Aboutus.findOne({}, {
            _id: 0
        }).sort({
            _id: -1
        });
        return res.reply(messages.success(), {
            aAboutus
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getFAQsData = async (req, res) => {
   
    try {
        const aFAQs = await FAQs.find({}, {
            
        }).sort({ sOrder: 1 });
        return res.reply(messages.success(), aFAQs);
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getTermsData = async (req, res) => {
    try {
        const aTerms = await Terms.findOne({}, {
            _id: 0
        }).sort({
            _id: -1
        });
        return res.reply(messages.success(), {
            aTerms
        });
    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}


controllers.getUserProfilewithNfts = async (req, res) => {
    try {
       
        if (!req.body.userId) {
            return res.reply(messages.unauthorized());
        }
        let checkId= mongoose.Types.ObjectId.isValid(req.body.userId)
       

        if(checkId==true){
            User.findOne({
                $or:[
                    { _id: req.body.userId}, 
                    { sUserName: decodeURIComponent(req.body.userId) }
                ]
            },{
                oName: 1,
                sUserName: 1,
                sCreated: 1,
                sEmail: 1,
                sWalletAddress: 1,
                sProfilePicUrl: 1,
                sWebsite: 1,
                sBio: 1
            }, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));
    
                return res.reply(messages.no_prefix('User Details'), user);
            });
        }else{
            User.findOne({
                sUserName : decodeURIComponent(req.body.userId)
            }, {
                oName: 1,
                sUserName: 1,
                sCreated: 1,
                sEmail: 1,
                sWalletAddress: 1,
                sProfilePicUrl: 1,
                sWebsite: 1,
                sBio: 1
            }, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));
    
                return res.reply(messages.no_prefix('User Details'), user);
            });
        }
       

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}


controllers.getUserWithNfts = async (req, res) => {
    try {

        if (!req.body.userId) return res.reply(messages.unauthorized());
        
        let checkId= mongoose.Types.ObjectId.isValid(req.body.userId)
        

        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);
        let oSortingOrder = {};
        log.red(req.body);

        if (req.body.sSortingType == "Recently Added") {
            oSortingOrder["sCreated"] = -1;
        } else if (req.body.sSortingType == "Most Viewed") {
            oSortingOrder["nView"] = -1;
        } else if (req.body.sSortingType == "Price Low to High") {
            oSortingOrder["nBasePrice"] = 1;
        } else if (req.body.sSortingType == "Price High to Low") {
            oSortingOrder["nBasePrice"] = -1;
        } else {
            oSortingOrder["_id"] = -1;
        }
       

        if(checkId==true){
            let user = await User.findOne({
                $or:[
                    { _id: req.body.userId}, 
                    { sUserName: decodeURIComponent(req.body.userId) }
                ]
            }, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));
                
              
            });
            let data = await NFT.aggregate([{
                '$match': {
                    '$and': [{
                        '$or': [{
                            'oCurrentOwner': mongoose.Types.ObjectId(user._id)
                        }]
                    }]
                }
            }, {
                '$sort': oSortingOrder
            }, {
                '$project': {
                    '_id': 1,
                    'sName': 1,
                    'eType': 1,
                    'nBasePrice': 1,
                    'sHash': 1,
                    'nQuantity': 1,
                    'nTokenID': 1,
                    'oCurrentOwner': 1,
                    "sTransactionStatus": 1,
                    sGenre:  1,
                    sBpm: 1,
                    oPostedBy:1,
                    skey_equalTo: 1,
                    skey_harmonicTo:  1,
                    track_cover: 1,
                    eAuctionType: 1,
                    user_likes: {
                        "$size": {
                            "$filter": {
                                "input": "$user_likes",
                                "as": "user_likes",
                                "cond": {
                                    $eq: ["$$user_likes", mongoose.Types.ObjectId(req.userId)]
                                }
                            }
                        }
                    },
                    user_likes_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_likes"
                            },
                            then: {
                                $size: "$user_likes"
                            },
                            else: 0
                        }
                    }
                }
            },{
                '$project': {
                    '_id': 1,
                    'sName': 1,
                    'eType': 1,
                    'nBasePrice': 1,
                    'sHash': 1,
                    'nQuantity': 1,
                    'nTokenID': 1,
                    'oCurrentOwner': 1,
                    "sTransactionStatus": 1,
                    sGenre:  1,
                    sBpm: 1,
                    skey_equalTo: 1,
                    oPostedBy:1,
                    skey_harmonicTo:  1,
                    track_cover: 1,
                    eAuctionType: 1,
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
                    'localField': 'oCurrentOwner',
                    'foreignField': '_id',
                    'as': 'oUser'
                }
            }, { $unwind: '$oUser' }, {
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
    
            console.log('data with nft with listing is-------->',data)
            let iFiltered = data[0].nfts.length;
            if (data[0].totalCount[0] == undefined) {
                return res.reply(messages.success('Data'), {
                    data: 0,
                    "draw": req.body.draw,
                    "recordsTotal": 0,
                    "recordsFiltered": iFiltered,
                });
            } else {
                return res.reply(messages.no_prefix('NFT Details'), {
                    data: data[0].nfts,
                    "draw": req.body.draw,
                    "recordsTotal": data[0].totalCount[0].count,
                    "recordsFiltered": iFiltered,
                });
            }
        }
        if(checkId==false){
            let user=await User.findOne({
                sUserName : decodeURIComponent(req.body.userId)
            }, (err, user) => {
                if (err) return res.reply(messages.server_error());
                if (!user) return res.reply(messages.not_found('User'));
                
              
            });
          
            let data = await NFT.aggregate([{
                '$match': {
                    '$and': [{
                        '$or': [{
                            'oCurrentOwner':user._id
                        }]
                    }]
                }
            }, {
                '$sort': oSortingOrder
            },
            {
                $lookup: {
                  from: "users",
                  localField: "oPostedBy",
                  foreignField: "_id",
                  as: "oPostedByUser",
                },
              },
              { $unwind: "$oPostedByUser" },
             {
                
                '$project': {
                    '_id': 1,
                    'sName': 1,
                    'eType': 1,
                    'nBasePrice': 1,
                    'sHash': 1,
                    'nQuantity': 1,
                    'nTokenID': 1,
                    'oCurrentOwner': 1,
                    "sTransactionStatus": 1,
                    sGenre:  1,
                    sBpm: 1,
                    skey_equalTo: 1,
                    skey_harmonicTo:  1,
                    track_cover: 1,
                    eAuctionType: 1,
                    oPostedBy:1,
                    oPostedByUser:1,
                    user_likes: {
                        "$size": {
                            "$filter": {
                                "input": "$user_likes",
                                "as": "user_likes",
                                "cond": {
                                    $eq: ["$$user_likes", user._id]
                                }
                            }
                        }
                    },
                    user_likes_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_likes"
                            },
                            then: {
                                $size: "$user_likes"
                            },
                            else: 0
                        }
                    }
                }
            },{
                '$project': {
                    '_id': 1,
                    'sName': 1,
                    'eType': 1,
                    'nBasePrice': 1,
                    'sHash': 1,
                    'nQuantity': 1,
                    'nTokenID': 1,
                    'oCurrentOwner': 1,
                    "sTransactionStatus": 1,
                    sGenre:  1,
                    sBpm: 1,
                    skey_equalTo: 1,
                    skey_harmonicTo:  1,
                    track_cover: 1,
                    eAuctionType: 1,
                    oPostedBy:1,
                    oPostedByUser:1,
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
                    'localField': 'oCurrentOwner',
                    'foreignField': '_id',
                    'as': 'oUser'
                }
            }, { $unwind: '$oUser' }, {
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
    
          
            let iFiltered = data[0].nfts.length;
            if (data[0].totalCount[0] == undefined) {
                return res.reply(messages.success('Data'), {
                    data: 0,
                    "draw": req.body.draw,
                    "recordsTotal": 0,
                    "recordsFiltered": iFiltered,
                });
            } else {
                return res.reply(messages.no_prefix('NFT Details'), {
                    data: data[0].nfts,
                    "draw": req.body.draw,
                    "recordsTotal": data[0].totalCount[0].count,
                    "recordsFiltered": iFiltered,
                });
            }
        }
       

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

controllers.getAllUserDetails = async (req, res) => {
    try {

        var nLimit = parseInt(req.body.length);
        var nOffset = parseInt(req.body.start);
        var search = req.body.sTextsearch;
        var oTypeQuery = {};
        if(search != ""){
            oTypeQuery = { sUserName: new RegExp(search, 'i')};
        }
 
        let aggQuery = [];
        if (!req.userId) {

            
            aggQuery = [
                {
                    $match: {
                        $and: [
                            oTypeQuery
                        ]
                    },
                }, 
                {
                '$sort': {
                    'sCreated': -1
                }
            }, 
        
            {
                '$project': {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    is_user_following: 'false',
                    user_followings: 1,
                    user_followings_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_followings"
                            },
                            then: {
                                $size: "$user_followings"
                            },
                            else: 0
                        }
                    }
                }
            },
             {
                '$facet': {
                    'users': [{
                        "$skip": nOffset,
                        
                    }, {
                        "$limit": nLimit
                    }],
                    'totalCount': [{
                        '$count': 'count'
                    }]
                }
            }];
          
        } else {

            
            aggQuery = [{
                $match: {
                    $and: [
                        { _id: { $ne: mongoose.Types.ObjectId(req.userId) } },
                        oTypeQuery
                    ]
                },
            }, {
                '$sort': {
                    'sCreated': -1
                }
            }, {
                $project: {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    user_followings: {
                        "$size": {
                            "$filter": {
                                "input": "$user_followings",
                                "as": "user_followings",
                                "cond": {
                                    $eq: ["$$user_followings", mongoose.Types.ObjectId(req.userId)]
                                }
                            }
                        }
                    },
                    user_followings_size: {
                        $cond: {
                            if: {
                                $isArray: "$user_followings"
                            },
                            then: {
                                $size: "$user_followings"
                            },
                            else: 0
                        }
                    }
                }
            }, {
                $project: {
                    sWalletAddress: 1,
                    sUserName: 1,
                    sEmail: 1,
                    oName: 1,
                    sRole: 1,
                    sCreated: 1,
                    sStatus: 1,
                    sHash: 1,
                    sBio: 1,
                    sWebsite: 1,
                    sProfilePicUrl: 1,
                    aCollaborators: 1,
                    sResetPasswordToken: 1,
                    sResetPasswordExpires: 1,
                    is_user_following: {
                        $cond: {
                            if: {
                                $gte: ["$user_followings", 1]
                            },
                            then: 'true',
                            else: 'false'
                        }
                    },
                    user_followings_size: 1
                }
            }, {
                '$facet': {
                    'users': [{
                        "$skip": +nOffset
                    }, {
                        "$limit": +nLimit
                    }],
                    'totalCount': [{
                        '$count': 'count'
                    }]
                }
            }];
        }
        let data = await User.aggregate(aggQuery).catch((er) => {
           
        })
   

        let iFiltered = data[0].users.length;
        if (data[0].totalCount[0] == undefined) {
            return res.reply(messages.success('Data'), {
                data: 0,
                "draw": req.body.draw,
                "recordsTotal": 0,
                "recordsFiltered": iFiltered,
            });
        } else {
            return res.reply(messages.no_prefix('User Details'), {
                data: data[0].users,
                "draw": req.body.draw,
                "recordsTotal": data[0].totalCount[0].count,
                "recordsFiltered": iFiltered,
            });
        }

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}


controllers.followUser = async (req, res) => {
    try {
        if (!req.userId) return res.reply(messages.unauthorized());

        let {
            id
        } = req.body;

        return User.findOne({ _id: mongoose.Types.ObjectId(id) }).then(async (userData) => {
            if (userData && userData != null) {
                let followMAINarray = [];
                followMAINarray = userData.user_followings;

                let flag = '';

                let followARY = userData.user_followings && userData.user_followings.length ? userData.user_followings.filter((v) => v.toString() == req.userId.toString()) : [];

                if (followARY && followARY.length) {
                    flag = 'dislike';
                    var index = followMAINarray.indexOf(followARY[0]);
                    if (index != -1) {
                        followMAINarray.splice(index, 1);
                    }
                } else {
                    flag = 'like';
                    followMAINarray.push(mongoose.Types.ObjectId(req.userId))
                }

                await User.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { $set: { user_followings: followMAINarray } }).then((user) => {

                    // if (err) return res.reply(messages.server_error());

                    if (flag == 'like') {
                        return res.reply(messages.updated('User followed successfully.'));
                    } else {
                        return res.reply(messages.updated('User unfollowed successfully.'));
                    }

                });


            } else {
                return res.reply(messages.bad_request('User not found.'));
            }
        })

    } catch (error) {
        log.red(error)
        return res.reply(messages.server_error());
    }
}

module.exports = controllers;