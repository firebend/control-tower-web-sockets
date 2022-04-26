import UrlValidator from './UrlValidator';

describe('UrlValidator', () => {
  it('should validate http', () =>{
    expect(UrlValidator('http://fake.com')).toBeTruthy();
  })

  it('should validate https', () =>{
    expect(UrlValidator('https://fake.com')).toBeTruthy();
  })

  it('should not validate relative', () =>{
    expect(UrlValidator('/fake/api')).toBeFalsy();
  })

  it('should not validate rando string', () =>{
    expect(UrlValidator('rando')).toBeFalsy();
  })
});
