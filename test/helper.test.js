const helper = require('../src/helper');
const process = require('process');

describe('dateFromEpoch()', () => {
  const fixtures = {
    date: new Date((new Date()).setMilliseconds(0)),
    epochTs: () => {
      return Math.round(fixtures.date / 1000);
    },
  };

  test('returns a Date object for an epoch timestamp', () => {
    expect(helper.dateFromEpoch(fixtures.epochTs())).toEqual(fixtures.date);
  });
});

describe('checkUrl()', () => {
  const fixtures = {
    noUrlErrorMessage: 'no url given',
    invalidUrlErrorMessage: 'invalid url',
    invalidUrls: [
      'foo',
      'http;//example.org',
      ' ',
      'example.org',
    ],
    validUrls: [
      'https://example.org',
      'http://example.org',
    ],
  };

  test('throws an Error if no url is given', () => {
    expect(() => {
      helper.checkUrl();
    }).toThrowError(new Error(fixtures.noUrlErrorMessage));
  });

  test('throws an Error if given url is not a valid url', () => {
    for (const url of fixtures.invalidUrls) {
      expect(() => {
        helper.checkUrl(url);
      }).toThrowError(new Error(fixtures.invalidUrlErrorMessage + ' ' + url));
    }
  });

  test('logs a debug message for invalid urls if debug parameter is set', () => {
    expect.hasAssertions();
    jest.spyOn(process.stderr, 'write').mockImplementationOnce(() => null);
    try {
      helper.checkUrl(fixtures.invalidUrls[0], true);
    } catch (error) {
      expect(process.stderr.write).toHaveBeenCalled();
    }
  });

  test('passed if given url is a valid url', () => {
    for (const url of fixtures.validUrls) {
      expect(() => {
        helper.checkUrl(url);
      }).not.toThrow();
    }
  });
});
