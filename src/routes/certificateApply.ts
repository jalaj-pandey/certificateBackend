import express from 'express';
import { allApplications, newCertificate, processApplicationStatus } from '../controller/certificateApply';
import { adminOnly } from '../middlewares/admin';
import { applyForCertificate, getCertificate } from '../controller/certificateController';

const router = express.Router();

router.post('/new-apply', newCertificate)

router.get('/all', adminOnly, allApplications)

router.patch('/process-status/:id', adminOnly,processApplicationStatus)

router.post('/applyc', applyForCertificate);
router.get('/getc/:userId/:certificateId', getCertificate);


export default router;