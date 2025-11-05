// src/modules/user/infrastructure/repositories/user.repository.ts
import User, { IUser } from '../models/user.model';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(userData: Partial<IUser>): Promise<IUser>;
  updatePreferences(userId: string, preferences: string[]): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
  addReadArticle(userId: string, articleUrl: string): Promise<IUser | null>;
  addFavoriteArticle(userId: string, articleUrl: string): Promise<IUser | null>;
  removeFavoriteArticle(userId: string, articleUrl: string): Promise<IUser | null>;
  getReadArticles(userId: string): Promise<string[]>;
  getFavoriteArticles(userId: string): Promise<string[]>;
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

  async addReadArticle(userId: string, articleUrl: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // Add to readArticles if not already present
    if (!user.readArticles.includes(articleUrl)) {
      user.readArticles.push(articleUrl);
      await user.save();
    }

    return user;
  }

  async addFavoriteArticle(userId: string, articleUrl: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // Add to favoriteArticles if not already present
    if (!user.favoriteArticles.includes(articleUrl)) {
      user.favoriteArticles.push(articleUrl);
      await user.save();
    }

    return user;
  }

  async removeFavoriteArticle(userId: string, articleUrl: string): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    // Remove from favoriteArticles if present
    user.favoriteArticles = user.favoriteArticles.filter(url => url !== articleUrl);
    await user.save();

    return user;
  }

  async getReadArticles(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    return user?.readArticles || [];
  }

  async getFavoriteArticles(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    return user?.favoriteArticles || [];
  }
}