import { FromNowPipe } from './from-now.pipe';

describe('FromNowPipe', () => {
  let pipe: FromNowPipe;

  beforeEach(() => {
    pipe = new FromNowPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
