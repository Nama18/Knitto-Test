import { Request, Response } from "express";
import multer from "multer";
import Helper from "../helper/Helper";

const uploadFile = async (req: Request, res: Response) => {
	try {
        
        if(!req.file){
            return res.status(409).send(Helper.ResponseData(409, "File doesn't exist", null, null));
        }

        return res.status(200).send(Helper.ResponseData(200, "File Upload Successfully", null, req.file?.originalname));
    } catch (error:any) {
		return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
}

export default  { uploadFile }; 