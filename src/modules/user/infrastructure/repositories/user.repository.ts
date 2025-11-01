// src/modules/user/infrastructure/repositories/user.repository.ts
import User, { IUser } from '../models/user.model';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  updatePreferences(userId: string, preferences: string[]): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async updatePreferences(userId: string, preferences: string[]): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId, 
      { preferences }, 
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}