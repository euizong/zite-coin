export default class UserDTO {
  id: number;
  email: string;
  name?: string;
  profile_image?: string;
  phone?: string;
  user_type?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;

  constructor({ id, email, name, profile_image, phone, user_type, is_active, created_at, updated_at }: {
    id: number;
    email: string;
    name?: string;
    profile_image?: string;
    phone?: string;
    user_type?: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.profile_image = profile_image;
    this.phone = phone;
    this.user_type = user_type;
    this.is_active = is_active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
