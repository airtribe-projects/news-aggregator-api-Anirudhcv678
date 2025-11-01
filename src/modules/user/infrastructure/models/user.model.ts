import {Schema, model, Document} from 'mongoose';

export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: string[];
    role: 'admin' | 'user';
}

const userSchema = new Schema<IUser>({
    name: { type: String, required:true},
    email: {type: String, required:true, unique:true},
    password: {type: String, required:true},
    preferences: {type: [String], default:[]},
    role: {type: String, enum : ['admin','user'], default:'user'},

},{timestamps:true});

const User = model<IUser>('User',userSchema);
export default User;