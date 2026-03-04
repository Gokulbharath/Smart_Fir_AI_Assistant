import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/User.js';

(async()=>{
 try{
   await mongoose.connect(process.env.MONGODB_URI,{ dbName:'smart_fir' });
   console.log('connected to mongo');
   const users = await User.find().limit(10).select('+password');
   users.forEach(u=>{
     console.log(u.email,u.role,u.status,u.password && u.password.substring(0,10));
   });
   process.exit(0);
 } catch(e){
   console.error('error',e);
   process.exit(1);
 }
})();