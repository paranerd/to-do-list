export class Settings {
  tfa: boolean;

  deserialize(input: any): Settings {
    Object.assign(this, input);

    return this;
  }
}
