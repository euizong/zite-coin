import db from '../../db';
import UserDTO from '../domain/user.dto';
import bcrypt from 'bcryptjs';

export interface IUser {
  email: string;
  password?: string;
  google_id?: string;
  name?: string;
  profile_image?: string;
  phone?: string;
  user_type?: string;
}

export const getAllUsers = async (): Promise<UserDTO[]> => {
  const rows = await db('users').select('*');
  return rows.map((row: any) => new UserDTO(row));
};

export const getUserById = async (id: number): Promise<UserDTO | null> => {
  const row = await db('users').where({ id }).first();
  return row ? new UserDTO(row) : null;
};

export const createUser = async (user: IUser): Promise<UserDTO> => {
  const { email, password, google_id, name, profile_image, phone, user_type } = user;
  const hashed = password ? await bcrypt.hash(password, 10) : undefined;
  const [created] = await db('users')
    .insert({ email, password: hashed, google_id, name, profile_image, phone, user_type: user_type || 'user' })
    .returning('*');
  return new UserDTO(created);
};

export const updateUser = async (id: number, user: IUser): Promise<UserDTO | null> => {
  const { email, password, google_id, name, profile_image, phone, user_type } = user;
  const updateData: any = { email, google_id, name, profile_image, phone, user_type, is_active: true, updated_at: db.fn.now() };
  if (password) updateData.password = await bcrypt.hash(password, 10);
  const [updated] = await db('users')
    .where({ id })
    .update(updateData)
    .returning('*');
  return updated ? new UserDTO(updated) : null;
};

export const deleteUser = async (id: number): Promise<void> => {
  await db('users').where({ id }).del();
};

export const deactivateUser = async (id: number): Promise<UserDTO | null> => {
  const [updated] = await db('users')
    .where({ id })
    .update({ is_active: false, updated_at: db.fn.now() })
    .returning('*');
  return updated ? new UserDTO(updated) : null;
};
