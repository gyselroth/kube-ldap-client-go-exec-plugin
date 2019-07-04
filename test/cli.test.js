const process = require('process');
const cli = require('../src/cli');

describe('logError()', () => {
  const fixtures = {
    errorMessage: 'foo',
  };
  test('logs error message to stderr', () => {
    jest.spyOn(process.stderr, 'write').mockImplementationOnce(() => null);
    const error = new Error(fixtures.errorMessage);

    cli.logError(error);
    expect(process.stderr.write).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(error.message))
    );
  });
});

describe('printUsageAndExit()', () => {
  const fixtures = {
    usageMessage: 'Usage: ',
    exitCode: 1,
  };
  test('logs usage to stderr and exits', () => {
    jest.spyOn(process.stderr, 'write').mockImplementationOnce(() => null);
    jest.spyOn(process, 'exit').mockImplementationOnce(() => null);

    cli.printUsageAndExit();
    expect(process.stderr.write).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(fixtures.usageMessage))
    );
    expect(process.exit).toHaveBeenCalledWith(fixtures.exitCode);
  });
});

// describe('readUsernameAndPassword()', () => {
//   const fixtures = {
//     username: 'john.doe',
//     password: 'secret',
//   };
//   test('reads username and password from stdin', () => {
//     const mockStdin = require('mock-stdin').stdin();
//     expect.hasAssertions();
//     return cli.readUsernameAndPassword().then(({username, password}) => {
//       expect(username).toEqual(fixtures.username);
//       expect(password).toEqual(fixtures.password);
//     });
//     mockStdin.send(fixtures.username).send(null).send(fixtures.password).send(null);
//   });
// });
