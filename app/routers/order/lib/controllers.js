const fs = require("fs");
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https',auth: '21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439'});

const { Order } = require("../../../models");
const pinataSDK = require("@pinata/sdk");
const multer = require("multer");
const pinata = pinataSDK(
  process.env.PINATAAPIKEY,
  process.env.PINATASECRETAPIKEY
);
const mongoose = require("mongoose");
const validators = require("./validators");
var jwt = require("jsonwebtoken");
const controllers = {};






controllers.createOrder = async (req, res) => {
  try {
    console.log("Request Order" + JSON.stringify(req));

    const order = new Order({
      order:req.body.order,
      sign: req.body.sign,
      oPostedBy: req.userId,
      status: req.body.status
    });

    order
      .save()
      .then((result) => {
        return res.reply(messages.created("Order"), result);
      })
      .catch((error) => {
        return res.reply(messages.already_exists("Failed:"+error));
      });

    // upload(req, res, function (error) {
    //   if (error) {
    //     //instanceof multer.MulterError
    //     log.red(error);
    //     fs.unlinkSync(req.file.path);
    //     return res.reply(messages.bad_request(error.message));
    //   } else {
    //     log.green(req.body);

    //     if (!req.body.sName) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Title"));
    //     }
    //     if (!req.body.nQuantity) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Quantity"));
    //     }
    //     if (!req.body.sCollaborator) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Collaborators"));
    //     }
    //     if (!req.body.nCollaboratorPercentage) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Collaborator Percentages"));
    //     }
    //     if (!req.body.sSetRoyaltyPercentage) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Royalty Percentages"));
    //     }
    //     if (!req.body.eAuctionType) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Auction Type"));
    //     }
    //     if (!req.body.nBasePrice) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.not_found("Base Price"));
    //     }

    //     if (!validators.isValidString(req.body.sName)) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Title"));
    //     }
    //     if (!validators.isValidString(req.body.eAuctionType)) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Auction Type"));
    //     }
    //     if (!validators.isValidString(req.body.sName)) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Title"));
    //     }
    //     if (!validators.isValidSellingType(req.body.eAuctionType)) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Auction Type"));
    //     }
    //     if (req.body.eAuctionType != "Unlockable" && req.body.nBasePrice <= 0) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Base Price"));
    //     }
    //     if (req.body.sNftdescription.trim().length > 1000) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Description"));
    //     }
    //     if (isNaN(req.body.nQuantity) || !req.body.nQuantity > 0) {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Quantity"));
    //     }
    //     if (isNaN(req.body.sSetRoyaltyPercentage)) {
    //       log.red("NaN");
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Royalty Percentages"));
    //     }
    //     if (req.body.sSetRoyaltyPercentage < 0) {
    //       log.red("Greater Than 0");
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Royalty Percentages"));
    //     }
    //     if (!(req.body.sSetRoyaltyPercentage <= 100)) {
    //       log.red("Less Than 100");
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.invalid("Royalty Percentages"));
    //     }

    //     if (!req.file) {
    //       return res.reply(messages.not_found("File"));
    //     }

    //     // Check for duplicate Collaborator address
    //     if (
    //       new Set(req.body.sCollaborator.split(",")).size !==
    //       req.body.sCollaborator.split(",").length
    //     ) {
    //       return res.reply(
    //         messages.bad_request(
    //           "You Can't select same collaborator multiple times"
    //         )
    //       );
    //     }

    //     const oOptions = {
    //       pinataMetadata: {
    //         name: req.file.originalname,
    //       },
    //       pinataOptions: {
    //         cidVersion: 0,
    //       },
    //     };
    //     const readableStreamForFile = fs.createReadStream(req.file.path);

    //     let testFile = fs.readFileSync(req.file.path);
    //     //Creating buffer for ipfs function to add file to the system
    //     let testBuffer = new Buffer(testFile);
        
    //     ipfs.files.add(testBuffer).then(async (file2) => {
    //       fs.unlinkSync(req.file.path);
    //         let oNFTData = await NFT.findOne({
    //           sHash: file2[0].hash,
    //           $and: [
    //             {
    //               sTransactionStatus: {
    //                 $ne: -1,
    //               },
    //               sTransactionStatus: {
    //                 $ne: -99,
    //               },
    //             },
    //           ],
    //         });
    //         /*
    //         if (oNFTData) {
    //           if (file2[0].hash === oNFTData.sHash)
    //             return res.reply(messages.already_exists("NFT"));
    //         }
    //         */
            
    //     })
    //     .catch((e) => {
    //       fs.unlinkSync(req.file.path);
    //       return res.reply(messages.error());
    //     });
    //   }
    // });
  } catch (error) {
    return res.reply(messages.server_error());
  }
};


// controllers.landing = async (req, res) => {
//   try {
//     console.log("---------------------1");

//     req.userId =
//       req.userId && req.userId != undefined && req.userId != null
//         ? req.userId
//         : "";
//     console.log("---------------------2", req.userId);

//     let data = await NFT.aggregate([
//       {
//         $facet: {
//           recentlyAdded: [
//             {
//               $match: {
//                 sTransactionStatus: {
//                   $eq: 1,
//                 },
//                 eAuctionType: {
//                   $ne: "Unlockable",
//                 },
//               },
//             },
//             {
//               $sort: {
//                 _id: -1,
//               },
//             },
//             {
//               $limit: 10,
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "oCurrentOwner",
//                 foreignField: "_id",
//                 as: "aCurrentOwner",
//               },
//             },
//             { $unwind: "$aCurrentOwner" },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 nView: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 nTokenID: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 user_likes: {
//                   $size: {
//                     $filter: {
//                       input: "$user_likes",
//                       as: "user_likes",
//                       cond: {
//                         $eq: [
//                           "$$user_likes",
//                           req.userId &&
//                           req.userId != undefined &&
//                           req.userId != null
//                             ? mongoose.Types.ObjectId(req.userId)
//                             : "",
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 user_likes_size: {
//                   $cond: {
//                     if: {
//                       $isArray: "$user_likes",
//                     },
//                     then: {
//                       $size: "$user_likes",
//                     },
//                     else: 0,
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 nView: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 nTokenID: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 is_user_like: {
//                   $cond: {
//                     if: {
//                       $gte: ["$user_likes", 1],
//                     },
//                     then: "true",
//                     else: "false",
//                   },
//                 },
//                 user_likes_size: 1,
//               },
//             },
//           ],
//           onSale: [
//             {
//               $match: {
//                 sTransactionStatus: {
//                   $eq: 1,
//                 },
//                 eAuctionType: {
//                   $eq: "Fixed Sale",
//                 },
//               },
//             },
//             {
//               $sort: {
//                 _id: -1,
//               },
//             },
//             {
//               $limit: 10,
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "oCurrentOwner",
//                 foreignField: "_id",
//                 as: "aCurrentOwner",
//               },
//             },
//             { $unwind: "$aCurrentOwner" },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 nView: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 nTokenID: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 user_likes: {
//                   $size: {
//                     $filter: {
//                       input: "$user_likes",
//                       as: "user_likes",
//                       cond: {
//                         $eq: [
//                           "$$user_likes",
//                           req.userId &&
//                           req.userId != undefined &&
//                           req.userId != null
//                             ? mongoose.Types.ObjectId(req.userId)
//                             : "",
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 user_likes_size: {
//                   $cond: {
//                     if: {
//                       $isArray: "$user_likes",
//                     },
//                     then: {
//                       $size: "$user_likes",
//                     },
//                     else: 0,
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 nView: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 nTokenID: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 is_user_like: {
//                   $cond: {
//                     if: {
//                       $gte: ["$user_likes", 1],
//                     },
//                     then: "true",
//                     else: "false",
//                   },
//                 },
//                 user_likes_size: 1,
//               },
//             },
//           ],
//           onAuction: [
//             {
//               $match: {
//                 sTransactionStatus: {
//                   $eq: 1,
//                 },
//                 eAuctionType: {
//                   $eq: "Auction",
//                 },
//               },
//             },
//             {
//               $sort: {
//                 _id: -1,
//               },
//             },
//             {
//               $limit: 10,
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "oCurrentOwner",
//                 foreignField: "_id",
//                 as: "aCurrentOwner",
//               },
//             },
//             { $unwind: "$aCurrentOwner" },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 nView: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 nTokenID: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 user_likes: {
//                   $size: {
//                     $filter: {
//                       input: "$user_likes",
//                       as: "user_likes",
//                       cond: {
//                         $eq: [
//                           "$$user_likes",
//                           req.userId &&
//                           req.userId != undefined &&
//                           req.userId != null
//                             ? mongoose.Types.ObjectId(req.userId)
//                             : "",
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 user_likes_size: {
//                   $cond: {
//                     if: {
//                       $isArray: "$user_likes",
//                     },
//                     then: {
//                       $size: "$user_likes",
//                     },
//                     else: 0,
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 sHash: 1,
//                 eType: 1,
//                 sCreated: 1,
//                 oCurrentOwner: 1,
//                 oPostedBy: 1,
//                 sCollection: 1,
//                 sName: 1,
//                 sCollaborator: 1,
//                 sNftdescription: 1,
//                 sGenre:  1,
//                 sBpm: 1,
//                 skey_equalTo: 1,
//                 skey_harmonicTo:  1,
//                 track_cover: 1,
//                 nCollaboratorPercentage: 1,
//                 sSetRroyalityPercentage: 1,
//                 nQuantity: 1,
//                 nView: 1,
//                 nBasePrice: 1,
//                 eAuctionType: 1,
//                 nTokenID: 1,
//                 sTransactionHash: 1,
//                 sTransactionStatus: 1,
//                 aCurrentOwner: 1,
//                 is_user_like: {
//                   $cond: {
//                     if: {
//                       $gte: ["$user_likes", 1],
//                     },
//                     then: "true",
//                     else: "false",
//                   },
//                 },
//                 user_likes_size: 1,
//               },
//             },
//           ],
//         },
//       },
//     ]);
//     console.log("---------------------data", data);

//     data[0].users = [];
//     data[0].users = await User.find({ sRole: "user" });

//     let agQuery = [
//       {
//         $lookup: {
//           from: "users",
//           localField: "oCreatedBy",
//           foreignField: "_id",
//           as: "oUser",
//         },
//       },
//       {
//         $sort: {
//           sCreated: -1,
//         },
//       },
//       { $unwind: "$oUser" },
//     ];

//     data[0].collections = [];
//     data[0].collections = await Collection.aggregate(agQuery);
//     return res.reply(messages.success(), data[0]);
//   } catch (error) {
//     return res.reply(messages.server_error());
//   }
// };


controllers.updateOrder = async (req, res) => {
  try {
    
    
  } catch (error) {
    console.log(error);
    return res.reply(messages.server_error());
  }
};

controllers.getOrder=async(req,res)=>{
  console.log("hii");
  return res.reply(messages.success());
}

module.exports = controllers;
