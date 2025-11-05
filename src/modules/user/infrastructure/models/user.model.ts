import {Schema, model, Document, Types} from 'mongoose';

export interface IUser extends Document{
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: string[];
    role: 'admin' | 'user';
    readArticles: string[]; // Array of article URLs
    favoriteArticles: string[]; // Array of article URLs
}

const userSchema = new Schema<IUser>({
    name: { type: String, required:true},
    email: {type: String, required:true, unique:true},
    password: {type: String, required:true},
    preferences: {type: [String], default:[]},
    role: {type: String, enum : ['admin','user'], default:'user'},
    readArticles: {type: [String], default:[]},
    favoriteArticles: {type: [String], default:[]},
},{timestamps:true});

const User = model<IUser>('User',userSchema);
export default User;