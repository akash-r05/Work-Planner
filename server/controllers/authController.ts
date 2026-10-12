import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel, NotificationModel, ActivityModel, TaskModel, ProjectModel } from '../models/index.js';
import { generateToken, setTokenCookie, clearTokenCookie, AuthRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        compactView: false,
      },
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Initial welcome notification
    await NotificationModel.create({
      recipient: user._id,
      type: 'system',
      title: 'Welcome to Work Planner!',
      message: 'Start by creating your first project or organizing your daily agenda.',
    });

    await ActivityModel.create({
      actor: user._id,
      actorName: user.name,
      action: 'Created their account',
      entityType: 'auth',
      entityId: user._id,
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register account' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    await ActivityModel.create({
      actor: user._id,
      actorName: user.name,
      action: 'Signed in to workspace',
      entityType: 'auth',
      entityId: user._id,
    });

    const { passwordHash: _, resetPasswordToken: __, resetPasswordExpires: ___, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Signed in successfully',
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to sign in' });
  }
}

export async function logout(_req: Request, res: Response) {
  clearTokenCookie(res);
  return res.json({ success: true, message: 'Signed out successfully' });
}

export async function getMe(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const { passwordHash: _, resetPasswordToken: __, resetPasswordExpires: ___, ...safeUser } = req.user;
  return res.json({ success: true, user: safeUser });
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      // Return success anyway to avoid user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset token has been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await UserModel.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    return res.json({
      success: true,
      message: 'Password reset instructions have been generated.',
      resetToken, // Provided in development response for direct verification
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process forgot password' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and new password (min 6 characters) are required' });
    }

    const user = await UserModel.findOne(u => u.resetPasswordToken === token);
    if (!user || !user.resetPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Password reset token has expired' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(user._id, {
      passwordHash: newHash,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    await NotificationModel.create({
      recipient: user._id,
      type: 'system',
      title: 'Security Alert: Password Updated',
      message: 'Your account password was successfully reset.',
    });

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, avatar, preferences, currentPassword, newPassword } = req.body;
    const updates: any = {};

    if (name && typeof name === 'string') {
      updates.name = name.trim();
    }
    if (avatar !== undefined) {
      updates.avatar = avatar;
    }
    if (preferences && typeof preferences === 'object') {
      updates.preferences = {
        ...req.user.preferences,
        ...preferences,
      };
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, updates);
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    await ActivityModel.create({
      actor: req.user._id,
      actorName: updatedUser.name,
      action: 'Updated profile settings',
      entityType: 'auth',
      entityId: req.user._id,
    });

    const { passwordHash: _, resetPasswordToken: __, resetPasswordExpires: ___, ...safeUser } = updatedUser;
    return res.json({ success: true, message: 'Profile updated successfully', user: safeUser });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userId = req.user._id;
    await TaskModel.deleteMany({ owner: userId });
    await ProjectModel.deleteMany({ owner: userId });
    await NotificationModel.deleteMany({ recipient: userId });
    await ActivityModel.deleteMany({ actor: userId });
    await UserModel.findByIdAndDelete(userId);

    clearTokenCookie(res);
    return res.json({ success: true, message: 'Account and associated records deleted permanently' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
}
