import multer from 'multer';
import crypto from 'crypto';
import { resolve } from 'path';

const tmpFolder = resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolder,

  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (req, file, cb) => {
      const fileSuffix = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileSuffix}-${file.originalname}`;

      return cb(null, fileName);
    },
  }),
};
