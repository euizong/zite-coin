export default class WalletDTO {
  id: number;
  user_id: number;
  address: string;
  type?: string;
  is_primary?: boolean;
  created_at?: Date;
  updated_at?: Date;

  constructor({ id, user_id, address, type, is_primary, created_at, updated_at }: {
    id: number;
    user_id: number;
    address: string;
    type?: string;
    is_primary?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }) {
    this.id = id;
    this.user_id = user_id;
    this.address = address;
    this.type = type;
    this.is_primary = is_primary;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
