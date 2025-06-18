import express from 'express';
import { getDB } from '../../singleton';
import { Request, Response } from 'express';
import {
    CreateRoleResponseBody,
} from '@thesis/auth';
import { CreateDiagnostikRequestBody, Diagnostik } from '@thesis/diagnostik';

let router = express.Router();

router.post('/',async (
    req: Request<{}, {}, CreateDiagnostikRequestBody>,
    res: Response<CreateRoleResponseBody>
) => {
    console.log(req.body, req.params)
    if (!req.userId) {
        return;
    }
    const msg = await getDB().createDiagnostik(req.userId, req.body as Diagnostik)
    res.status(msg.success ? 200 : 400).json(msg);
});

export { router };
