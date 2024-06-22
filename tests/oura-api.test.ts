import OuraApi from '../oura-api'; // Adjust the import path as necessary
import { OuraUserInfo } from '../types'; // Adjust the import path as necessary
import request from 'obsidian'; // Adjust the import path as necessary

const OURA_API_URL = 'https://api.ouraring.com/v2/usercollection'

jest.mock('some-request-library');

describe('getUserInfo', () => {
  it('should return user info if token is present', async () => {
    const mockToken = 'mockToken';
    const mockResponse = JSON.stringify({
      id: '123',
      age: 25,
      gender: 'male',
      email: 'test@example.com',
    });
    (request as unknown as jest.Mock).mockResolvedValue(mockResponse);

    const api = new OuraApi(mockToken);
    const userInfo: OuraUserInfo | null = await api.getUserInfo();

    expect(request).toHaveBeenCalledWith({
      url: `https://api.ouraring.com/v1/personal_info`,
      headers: {
        'Authorization': `Bearer ${mockToken}`,
      },
    });
    expect(userInfo).toEqual(JSON.parse(mockResponse));
  });

  it('should return null if token is not present', async () => {
    const api = new OuraApi(null);
    const userInfo: OuraUserInfo | null = await api.getUserInfo();

    expect(userInfo).toBeNull();
  });
});