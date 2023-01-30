const router = require('express').Router();
const orderController = require('./lib/controllers');
const orderMiddleware = require('./lib/middleware');

router.post('/createOrder', orderMiddleware.verifyToken, orderController.createOrder);
router.put('/updateOrder', orderMiddleware.verifyToken, orderController.updateOrder);
router.get('/getOrder', orderController.getOrder)
// router.get('/orderList', orderMiddleware.verifyToken, orderController.collectionlist);
// router.get('/viewnft/:nNFTId',nftMiddleware.verifyWithoutToken, nftController.nftID);

// // router.post('/list', nftMiddleware.verifyToken, nftController.list);
// router.post('/mynftlist', nftMiddleware.verifyToken, nftController.mynftlist);
// router.post('/createCollection', nftMiddleware.verifyToken, nftController.createCollection);
// router.get('/collectionList', nftMiddleware.verifyToken, nftController.collectionlist);
// router.post('/nftListing',nftMiddleware.verifyWithoutToken, nftController.nftListing);
// router.get('/viewnft/:nNFTId',nftMiddleware.verifyWithoutToken, nftController.nftID);
// router.post('/setTransactionHash', nftMiddleware.verifyToken, nftController.setTransactionHash);
// router.get('/landing',nftMiddleware.verifyWithoutToken, nftController.landing);

// router.get("/deleteNFT/:nNFTId", nftMiddleware.verifyToken, nftController.deleteNFT);
// router.post('/allCollectionWiseList',nftMiddleware.verifyWithoutToken, nftController.allCollectionWiselist);

// router.put('/updateBasePrice', nftMiddleware.verifyToken, nftController.updateBasePrice);

// router.put('/toggleSellingType', nftMiddleware.verifyToken, nftController.toggleSellingType);
// router.post('/myCollectionList', nftMiddleware.verifyToken, nftController.collectionlistMy);

// router.post("/like", nftMiddleware.verifyToken, nftController.likeNFT);
// router.post("/uploadImage", nftMiddleware.verifyToken, nftController.uploadImage);


// nNFTId: 6120eba598b61743cf49a43f
// nBasePrice: 1
//https://decryptnft.io/api/v1/nft/updateBasePrice
module.exports = router;