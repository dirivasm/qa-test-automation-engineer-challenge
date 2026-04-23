import type { APIRequestContext } from '@playwright/test';

/**
 * Thin client over automationexercise.com's public API.
 * Endpoints documented at https://automationexercise.com/api_list
 *
 * Note: the site returns HTTP 200 for every call; the actual status
 * is embedded in a JSON body field `responseCode`. We normalize that here.
 */
export interface AuthApiResponse {
  responseCode: number;
  message: string;
}

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserDetailResponse {
  responseCode: number;
  user?: UserDetail;
  message?: string;
}

export class AuthApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly apiBaseURL: string,
  ) {}

  /** POST /api/verifyLogin — form-encoded `email`, `password`. */
  async verifyLogin(email: string, password: string): Promise<AuthApiResponse> {
    const res = await this.request.post(`${this.apiBaseURL}/verifyLogin`, {
      form: { email, password },
    });
    return this.parse(await res.text());
  }

  /** POST /api/createAccount — form-encoded registration payload. */
  async createAccount(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthApiResponse> {
    const res = await this.request.post(`${this.apiBaseURL}/createAccount`, {
      form: {
        name: input.name,
        email: input.email,
        password: input.password,
        title: 'Mr',
        birth_date: '1',
        birth_month: '1',
        birth_year: '1990',
        firstname: input.name.split(' ')[0] ?? input.name,
        lastname: input.name.split(' ').slice(1).join(' ') || 'QA',
        company: 'NanLabs',
        address1: '123 Test Street',
        address2: '',
        country: 'United States',
        zipcode: '12345',
        state: 'CA',
        city: 'San Francisco',
        mobile_number: '5555555555',
      },
    });
    return this.parse(await res.text());
  }

  /** GET /api/getUserDetailByEmail?email=... */
  async getUserDetailByEmail(email: string): Promise<UserDetailResponse> {
    const res = await this.request.get(`${this.apiBaseURL}/getUserDetailByEmail`, {
      params: { email },
    });
    const body = await res.text();
    try {
      const json = JSON.parse(body) as Partial<UserDetailResponse>;
      return {
        responseCode: Number(json.responseCode ?? 0),
        user: json.user,
        message: json.message,
      };
    } catch {
      return { responseCode: 0, message: body };
    }
  }

  private parse(body: string): AuthApiResponse {
    try {
      const json = JSON.parse(body) as Partial<AuthApiResponse>;
      return {
        responseCode: Number(json.responseCode ?? 0),
        message: String(json.message ?? ''),
      };
    } catch {
      return { responseCode: 0, message: body };
    }
  }
}
