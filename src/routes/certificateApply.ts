import express from 'express';
import { allApplications, getSingleRequest, newCertificate, processApplicationStatus } from '../controller/certificateApply';
import { adminOnly } from '../middlewares/admin';

const router = express.Router();

router.post('/new-apply', newCertificate)

router.get('/all', adminOnly, allApplications)

// router.get('/apply', adminOnly, getSingleRequest)

router.patch('/process-status/:id', adminOnly,processApplicationStatus)

export default router;