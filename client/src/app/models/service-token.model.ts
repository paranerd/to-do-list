export class ServiceToken {
  id: string;
  name: string;
  created: number;
  token?: string;

  deserialize(input: any): ServiceToken {
    Object.assign(this, input);

    return this;
  }
}
