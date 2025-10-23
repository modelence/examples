export const getConfig = jest.fn();

export interface RouteParams {
  body: any;
  params: any;
  query: any;
  headers: any;
  session: any;
}

export interface RouteResponse<T> {
  status?: number;
  data?: T;
}

export const schema = {
  string: jest.fn(() => ({ type: 'string' })),
  enum: jest.fn((values) => ({ type: 'enum', values })),
  date: jest.fn(() => ({ type: 'date' })),
};

export class Store {
  constructor(public name: string, public config: any) {}

  insertOne = jest.fn();
  insertMany = jest.fn();
  findOne = jest.fn();
  find = jest.fn();
  updateOne = jest.fn();
  deleteOne = jest.fn();
}
