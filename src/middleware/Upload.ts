import multer from "multer";
import util from "util";

const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "../../../uploads");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);   
    },
});

let upload = multer({
    storage: storage,
    limits: { fileSize: maxSize }
});


export default upload