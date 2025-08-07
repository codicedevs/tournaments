import * as dotenv from 'dotenv';
dotenv.config();

export const serverSetting = Object.freeze({
  PORT: +(process.env.PORT ?? 6969),
  DBPASSWORD: process.env.DBPASSWORD,
  DB_URL: process.env.DB_URL,
  DB_URL_TEST: process.env.DB_URL_TEST,
});
