const router = require('express').Router();
const bidController = require('./lib/controllers');
const bidMiddleware = require('./lib/middleware');

router.post('/create', bidMiddleware.verifyToken, bidController.create);
router.post('/transfer', bidMiddleware.verifyToken, bidController.transfer);
router.post('/history/:nNFTId',bidController.getBidHistoryOfItem);
router.post('/toggleBidStatus', bidMiddleware.verifyToken, bidController.toggleBidStatus);
router.post('/bidByUser', bidMiddleware.verifyToken, bidController.bidByUser);
router.post('/tokenHistory/:nTokenID',bidController.getHistoryOfToken);

router.get('/getAllAuctionbids/:nNFTId', bidMiddleware.verifyToken, bidController.getAllAuctionbids);
router.post('/getAuctionBidsHistory/:nNFTId', bidMiddleware.verifyToken, bidController.getAuctionBidsHistory);
router.get('/getCurrentAuctionBids/:nNFTId', bidMiddleware.verifyToken, bidController.getCurrentAuctionBids);
router.get('/getCurrentAuctionBidsList/:nNFTId', bidMiddleware.verifyToken, bidController.getCurrentAuctionBidsList);
router.post('/removeAuctionBidRecords', bidMiddleware.verifyToken, bidController.removeAuctionBidRecords);
router.post('/rejectAuctionBidRecords', bidMiddleware.verifyToken, bidController.rejectAuctionBidRecords);
router.post('/rejectAuctionbid', bidMiddleware.verifyToken, bidController.rejectAuctionbid);
router.post('/acceptAuctionbid', bidMiddleware.verifyToken, bidController.acceptAuctionbid);
router.get('/getSelectedAuctionBids/:nNFTId/:Owner', bidMiddleware.verifyToken, bidController.getSelectedAuctionBids);

module.exports = router;
