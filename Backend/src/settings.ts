import * as dotenv from 'dotenv';
dotenv.config();

export const serverSetting = Object.freeze({
  PORT: +(process.env.PORT ?? 6969),
  DBPASSWORD: process.env.DBPASSWORD,
});
