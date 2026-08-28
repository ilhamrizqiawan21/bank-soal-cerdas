import client from '.';
import { normalizeUser } from '../domainApi';
import type { User } from '../../types';

type ApiResource<T> = { data: T };

export const authApi = {
  async me(): Promise<User> {
    const { data } = await client.get<ApiResource<User & { id: number | string; nip?: string }>>('/me');
    return normalizeUser(data.data);
  },
};
