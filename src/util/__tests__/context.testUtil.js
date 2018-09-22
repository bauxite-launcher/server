export default function withContext(factories, setup) {
  let values = {};

  beforeEach(async () => {
    for (let key of Object.keys(factories)) {
      values[key] = await factories[key](values);
    }
  });

  afterEach(() => {
    for (let key of Object.keys(factories)) {
      delete values[key];
    }
  });

  setup(values);
}
